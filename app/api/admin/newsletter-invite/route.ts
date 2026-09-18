import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'lance@westerndentalacademy.com',
  'ryan@westerndentalacademy.com',
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://westerndentalacademy.com'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function inviteEmailHtml(firstName: string, workshopName: string, confirmUrl: string): string {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background-color:#0D3B6E;padding:28px 32px;">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Stay Connected with WDA</h1>
    <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
  </div>
  <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
    <p style="color:#0D3B6E;font-size:15px;margin:0 0 16px;">Hi ${firstName},</p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Thank you for attending <strong>${workshopName}</strong> with Western Dental Academy.
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
      We'd love to keep you updated on upcoming events, courses, and professional development
      opportunities. Click below to join our mailing list.
    </p>
    <div style="text-align:center;margin:0 0 28px;">
      <a
        href="${confirmUrl}"
        style="display:inline-block;background-color:#E67E22;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;"
      >
        Join Our Mailing List →
      </a>
    </div>
    <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;">
      You're receiving this because you registered for a WDA event. If you'd prefer not to
      receive these emails, simply ignore this message — you won't be added to our list
      unless you click the button above.
    </p>
  </div>
  <div style="padding:16px 32px;background-color:#F4F7F9;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
  </div>
</div>`
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const user  = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { registrantIds, sendAll } = body as { registrantIds?: string[]; sendAll?: boolean }

  // Fetch target registrants
  let registrants: { _id: string; firstName: string; lastName: string; email: string; workshop: string }[] = []

  if (sendAll) {
    registrants = await client.fetch(
      `*[_type == "workshopRegistration" && !(_id in path("drafts.**")) && newsletterOptIn != true && stripePaymentStatus == "paid"]{
        _id, firstName, lastName, email, workshop
      }`
    )
    // De-duplicate by email — keep most recent registration
    const seen = new Map<string, typeof registrants[0]>()
    for (const r of registrants) {
      seen.set(r.email.toLowerCase(), r)
    }
    registrants = Array.from(seen.values())
  } else if (Array.isArray(registrantIds) && registrantIds.length > 0) {
    const idList = registrantIds.map(id => `"${id}"`).join(',')
    registrants = await client.fetch(
      `*[_id in [${idList}] && !(_id in path("drafts.**"))]{ _id, firstName, lastName, email, workshop }`
    )
  } else {
    return NextResponse.json({ error: 'Provide registrantIds or sendAll:true' }, { status: 400 })
  }

  let sent = 0
  let skipped = 0
  let alreadySubscribed = 0

  for (const r of registrants) {
    const normalEmail = r.email.trim().toLowerCase()

    // Check existing subscriber doc
    const existing = await client.fetch<{
      _id: string
      confirmed?: boolean
      inviteSentAt?: string
    } | null>(
      `*[_type == "subscriber" && !(_id in path("drafts.**")) && email == $email][0]{
        _id, confirmed, inviteSentAt
      }`,
      { email: normalEmail }
    )

    // Skip if already a confirmed subscriber
    if (existing?.confirmed === true) { alreadySubscribed++; continue }

    // Skip if invite sent within last 7 days (unconfirmed — wait before re-sending)
    if (existing?.inviteSentAt) {
      const sentAgo = Date.now() - new Date(existing.inviteSentAt).getTime()
      if (sentAgo < SEVEN_DAYS_MS) { skipped++; continue }
    }

    const token = crypto.randomUUID()
    const now   = new Date().toISOString()

    // Create or update subscriber doc
    if (existing) {
      await client.patch(existing._id).set({
        firstName:    r.firstName,
        lastName:     r.lastName,
        inviteToken:  token,
        inviteSentAt: now,
        confirmed:    false,
        source:       'invite',
      }).commit()
    } else {
      await client.create({
        _type:        'subscriber',
        email:        normalEmail,
        firstName:    r.firstName,
        lastName:     r.lastName,
        inviteToken:  token,
        inviteSentAt: now,
        confirmed:    false,
        active:       true,
        source:       'invite',
      })
    }

    // Send invite email
    const confirmUrl = `${SITE_URL}/subscribe/confirm?token=${token}`
    try {
      await resend.emails.send({
        from:    'Western Dental Academy <info@westerndentalacademy.com>',
        to:      normalEmail,
        subject: 'Join the WDA Community — Stay in the Loop',
        html:    inviteEmailHtml(r.firstName, r.workshop, confirmUrl),
      })
      sent++
    } catch (err) {
      console.error('Newsletter invite email error:', err)
      skipped++
    }
  }

  return NextResponse.json({ sent, skipped, alreadySubscribed })
}
