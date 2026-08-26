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
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { waitlistId, firstName, lastName, recipientEmail, workshop, workshopDate } =
    body as {
      waitlistId?: string
      firstName?: string
      lastName?: string
      recipientEmail?: string
      workshop?: string
      workshopDate?: string
    }

  if (!waitlistId || !recipientEmail || !workshop) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // Mark as notified in Sanity
    await client
      .patch(waitlistId)
      .set({ notified: true, notifiedAt: new Date().toISOString() })
      .commit()

    // Send notification email
    await resend.emails.send({
      from: 'Western Dental Academy <info@westerndentalacademy.com>',
      to: recipientEmail,
      subject: `A spot has opened — ${workshop}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0D3B6E; padding: 28px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Good News — A Spot Has Opened!</h1>
            <p style="color: rgba(255,255,255,0.55); margin: 6px 0 0; font-size: 13px;">Western Dental Academy</p>
          </div>
          <div style="padding: 28px 32px; background: #ffffff; border: 1px solid #e5e7eb;">
            <p style="color: #0D3B6E; font-size: 15px; font-weight: 600; margin: 0 0 16px;">Hi ${firstName ?? 'there'},</p>
            <p style="color: #374151; font-size: 14px; margin: 0 0 16px;">
              A spot has become available in <strong>${workshop}</strong>${workshopDate ? ` on ${workshopDate}` : ''}.
            </p>
            <p style="color: #374151; font-size: 14px; margin: 0 0 24px;">
              Please visit <a href="${process.env.NEXT_PUBLIC_SITE_URL}/workshops" style="color: #378ADD;">westerndentalacademy.com/workshops</a> to register before the spot fills up.
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              Questions? Reply to this email or contact us at
              <a href="mailto:info@westerndentalacademy.com" style="color: #378ADD;">info@westerndentalacademy.com</a>.
            </p>
          </div>
          <div style="padding: 14px 32px; background: #F4F7F9; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Western Dental Academy — 150 Chippewa Road, Suite 258, Sherwood Park, AB</p>
          </div>
        </div>
      `,
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Waitlist notify error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
