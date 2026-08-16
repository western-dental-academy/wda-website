import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const resend = new Resend(process.env.RESEND_API_KEY)

function countDays(start: string, end: string, halfDay: boolean): number {
  if (halfDay) return 0.5
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  return Math.max(1, Math.round((endMs - startMs) / 86_400_000) + 1)
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const staff = await client.fetch(
    `*[_type == "staffMember" && clerkUserId == $uid && active == true][0]{
      _id, vacationDaysPerYear, sickDaysPerYear
    }`,
    { uid: userId }
  )
  if (!staff) return Response.json({ error: 'Staff member not found' }, { status: 404 })

  const yearStart = `${new Date().getFullYear()}-01-01`

  const [approvedThisYear, requests] = await Promise.all([
    client.fetch(
      `*[_type == "timeOffRequest" && staffMember._ref == $id && status == "approved" && startDate >= $yearStart]{
        type, startDate, endDate, halfDay
      }`,
      { id: staff._id, yearStart }
    ),
    client.fetch(
      `*[_type == "timeOffRequest" && staffMember._ref == $id] | order(submittedAt desc)[0...20]{
        _id, type, startDate, endDate, halfDay, reason, status, submittedAt
      }`,
      { id: staff._id }
    ),
  ])

  const vacationUsed = approvedThisYear
    .filter((r: any) => r.type === 'vacation')
    .reduce((sum: number, r: any) => sum + countDays(r.startDate, r.endDate, r.halfDay), 0)

  const sickUsed = approvedThisYear
    .filter((r: any) => r.type === 'sick')
    .reduce((sum: number, r: any) => sum + countDays(r.startDate, r.endDate, r.halfDay), 0)

  return Response.json({
    balance: {
      vacationRemaining: Math.max(0, (staff.vacationDaysPerYear ?? 10) - vacationUsed),
      sickRemaining: Math.max(0, (staff.sickDaysPerYear ?? 5) - sickUsed),
    },
    requests,
  })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const staff = await client.fetch(
    `*[_type == "staffMember" && clerkUserId == $uid && active == true][0]{ _id, fullName, email }`,
    { uid: userId }
  )
  if (!staff) return Response.json({ error: 'Staff member not found' }, { status: 404 })

  const body = await req.json()
  const { type, startDate, endDate, halfDay = false, reason = '' } = body

  if (!type || !startDate || !endDate) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const request = await client.create({
    _type: 'timeOffRequest',
    staffMember: { _type: 'reference', _ref: staff._id },
    type,
    startDate,
    endDate,
    halfDay,
    reason: reason || undefined,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  })

  // Notify all active owners
  try {
    const owners = await client.fetch(
      `*[_type == "staffMember" && role == "owner" && active == true]{ email, fullName }`,
      {}
    )

    const typeLabel = ({ vacation: 'Vacation', sick: 'Sick', personal: 'Personal', unpaid: 'Unpaid' } as Record<string, string>)[type] ?? type
    const dateRange = startDate === endDate ? startDate : `${startDate} to ${endDate}`
    const dayCount = countDays(startDate, endDate, halfDay)
    const dayLabel = halfDay ? 'half day' : `${dayCount} day${dayCount !== 1 ? 's' : ''}`

    for (const owner of owners) {
      await resend.emails.send({
        from: 'Western Dental Academy <info@westerndentalacademy.com>',
        to: owner.email,
        subject: `Time-off request from ${staff.fullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0D3B6E; padding: 28px 32px;">
              <h1 style="color: white; margin: 0; font-size: 20px;">Time-Off Request</h1>
              <p style="color: rgba(255,255,255,0.55); margin: 6px 0 0; font-size: 13px;">Western Dental Academy Staff</p>
            </div>
            <div style="padding: 28px 32px; background: #ffffff; border: 1px solid #e5e7eb;">
              <p style="color: #0D3B6E; font-size: 15px; font-weight: 600; margin: 0 0 16px;">${staff.fullName} has submitted a time-off request.</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
                <tr><td style="padding: 6px 0; color: #6b7280; width: 120px;">Type</td><td style="padding: 6px 0; font-weight: 600;">${typeLabel}</td></tr>
                <tr><td style="padding: 6px 0; color: #6b7280;">Date</td><td style="padding: 6px 0; font-weight: 600;">${dateRange} (${dayLabel})</td></tr>
                ${reason ? `<tr><td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Reason</td><td style="padding: 6px 0;">${reason}</td></tr>` : ''}
              </table>
              <div style="margin-top: 24px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/staff/owner"
                   style="background-color: #E67E22; color: white; padding: 11px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                  Review Request
                </a>
              </div>
            </div>
            <div style="padding: 14px 32px; background: #F4F7F9; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Western Dental Academy — 150 Chippewa Road, Suite 258, Sherwood Park, AB</p>
            </div>
          </div>
        `,
      }).catch((err: Error) => console.error(`Owner notification email to ${owner.email} failed:`, err))
    }
  } catch (err) {
    console.error('Failed to send owner notifications:', err)
  }

  return Response.json({ request })
}
