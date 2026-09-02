import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'aiden2@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const resend = new Resend(process.env.RESEND_API_KEY)

function fmtWorkshopDate(iso: string): string {
  const d = new Date(iso)
  const datePart = d.toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const timePart = d.toLocaleTimeString('en-CA', {
    timeZone: 'America/Edmonton', hour: 'numeric', minute: '2-digit',
  }).replace('a.m.', 'AM').replace('p.m.', 'PM')
  const month = d.getMonth() + 1
  const day   = d.getDate()
  const isMDT = (month > 3 && month < 11) || (month === 3 && day >= 8)
  return `${datePart} · ${timePart} ${isMDT ? 'MDT' : 'MST'}`
}

function zoomLinkEmail(args: {
  firstName: string
  workshopName: string
  dateFormatted: string
  zoomLink: string
}): string {
  const { firstName, workshopName, dateFormatted, zoomLink } = args
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background-color:#0D3B6E;padding:28px 32px;">
    <h1 style="color:#ffffff;margin:0;font-size:18px;font-weight:700;">Western Dental Academy</h1>
    <p style="color:rgba(255,255,255,0.5);margin:4px 0 0;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;">Professional Development</p>
  </div>
  <div style="padding:32px 32px 24px;border:1px solid #e5e7eb;border-top:none;">
    <p style="color:#0D3B6E;font-size:15px;font-weight:600;margin:0 0 16px;">Hi ${firstName},</p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 8px;">
      Your Zoom link for <strong>${workshopName}</strong> is ready.
    </p>
    <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">${dateFormatted}</p>
    <div style="margin-bottom:28px;">
      <a href="${zoomLink}" style="display:inline-block;background-color:#E67E22;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 28px;border-radius:8px;">
        Join via Zoom →
      </a>
    </div>
    <div style="background:#F4F7F9;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="color:#0D3B6E;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">Tips for a great session</p>
      <ul style="color:#374151;font-size:13px;line-height:1.7;margin:0;padding-left:18px;">
        <li>Join 5 minutes early to test your audio and video</li>
        <li>Make sure your display name is set to your full name</li>
        <li>Have a quiet space ready with good lighting</li>
      </ul>
    </div>
    <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
      If you have any questions, reply to this email or contact us at
      <a href="mailto:info@westerndentalacademy.com" style="color:#378ADD;">info@westerndentalacademy.com</a>.
    </p>
  </div>
  <div style="padding:14px 32px;background:#F4F7F9;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">Western Dental Academy — 150 Chippewa Road, Suite 258, Sherwood Park, AB</p>
  </div>
</div>`
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user  = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { workshopDateId } = body as { workshopDateId?: string }
  if (!workshopDateId) return Response.json({ error: 'workshopDateId is required' }, { status: 400 })

  const dateDoc = await client.fetch<{
    date: string
    title: string
    zoomLink: string | null
    hasVirtualOption: boolean
  } | null>(
    `*[_type == "workshopDate" && _id == $id][0]{
      date,
      "title":          offering->title,
      "zoomLink":       offering->zoomLink,
      "hasVirtualOption": offering->hasVirtualOption
    }`,
    { id: workshopDateId }
  )

  if (!dateDoc) return Response.json({ error: 'Workshop date not found.' }, { status: 404 })
  if (!dateDoc.zoomLink?.trim()) {
    return Response.json({ error: 'No Zoom link has been added for this workshop yet.' }, { status: 400 })
  }

  const registrants = await client.fetch<Array<{ firstName: string; lastName: string; email: string }>>(
    `*[_type == "workshopRegistration" && workshopDateId == $id && deliveryMethod == "virtual"]{
      firstName, lastName, email
    }`,
    { id: workshopDateId }
  )

  if (registrants.length === 0) {
    return Response.json({ error: 'No virtual registrants found for this workshop.' }, { status: 400 })
  }

  const workshopName  = dateDoc.title
  const dateFormatted = fmtWorkshopDate(dateDoc.date)
  const zoomLink      = dateDoc.zoomLink

  try {
    await Promise.all(
      registrants.map(r =>
        resend.emails.send({
          from:    'Western Dental Academy <info@westerndentalacademy.com>',
          to:      r.email,
          subject: `Your Zoom Link for ${workshopName}`,
          html:    zoomLinkEmail({ firstName: r.firstName, workshopName, dateFormatted, zoomLink }),
        })
      )
    )
  } catch (err) {
    console.error('Send Zoom link error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }

  return Response.json({ sent: registrants.length })
}
