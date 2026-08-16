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

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const decider = await client.fetch(
    `*[_type == "staffMember" && clerkUserId == $uid && active == true][0]{ _id, fullName, role }`,
    { uid: userId }
  )
  if (!decider || decider.role !== 'owner') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { requestId, action, notes = '' } = body

  if (!requestId || !['approved', 'denied'].includes(action)) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const request = await client.fetch(
    `*[_type == "timeOffRequest" && _id == $id][0]{
      _id, type, startDate, endDate, halfDay, status,
      staffMember->{ _id, fullName, email }
    }`,
    { id: requestId }
  )
  if (!request) return Response.json({ error: 'Request not found' }, { status: 404 })
  if (request.status !== 'pending') {
    return Response.json({ error: 'Request already decided' }, { status: 409 })
  }

  await client.patch(requestId).set({
    status: action,
    decidedBy: { _type: 'reference', _ref: decider._id },
    decidedAt: new Date().toISOString(),
    ...(notes ? { decisionNotes: notes } : {}),
  }).commit()

  // Notify the requesting staff member
  try {
    const typeLabel = ({ vacation: 'Vacation', sick: 'Sick', personal: 'Personal', unpaid: 'Unpaid' } as Record<string, string>)[request.type] ?? request.type
    const dateRange = request.startDate === request.endDate ? request.startDate : `${request.startDate} to ${request.endDate}`
    const approved = action === 'approved'

    await resend.emails.send({
      from: 'Western Dental Academy <info@westerndentalacademy.com>',
      to: request.staffMember.email,
      subject: `Your time-off request has been ${action}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0D3B6E; padding: 28px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Time-Off Request ${approved ? 'Approved' : 'Denied'}</h1>
            <p style="color: rgba(255,255,255,0.55); margin: 6px 0 0; font-size: 13px;">Western Dental Academy Staff</p>
          </div>
          <div style="padding: 28px 32px; background: #ffffff; border: 1px solid #e5e7eb;">
            <p style="color: #0D3B6E; font-size: 15px; font-weight: 600; margin: 0 0 16px;">
              Hi ${request.staffMember.fullName},
            </p>
            <p style="color: #374151; font-size: 14px; margin: 0 0 20px; line-height: 1.6;">
              Your <strong>${typeLabel}</strong> request for <strong>${dateRange}</strong> has been
              <strong style="color: ${approved ? '#16a34a' : '#dc2626'};">${action}</strong>.
            </p>
            ${notes ? `
            <div style="background: #F4F7F9; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
              <p style="color: #6b7280; font-size: 12px; font-weight: 600; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.05em;">Note from management</p>
              <p style="color: #374151; font-size: 14px; margin: 0;">${notes}</p>
            </div>` : ''}
            ${approved ? `<p style="color: #374151; font-size: 14px; margin: 0;">Enjoy your time off!</p>` : `<p style="color: #374151; font-size: 14px; margin: 0;">If you have questions, please reach out to management.</p>`}
          </div>
          <div style="padding: 14px 32px; background: #F4F7F9; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Western Dental Academy — 150 Chippewa Road, Suite 258, Sherwood Park, AB</p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Decision notification email failed:', err)
  }

  return Response.json({ success: true, action })
}
