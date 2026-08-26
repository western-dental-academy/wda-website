import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { generateWorkshopCertificate } from '@/lib/workshops/certificate'

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

export async function POST(req: NextRequest) {
  // Accept Bearer token (from check-in route) OR Clerk auth + admin whitelist
  const authHeader = req.headers.get('Authorization')
  const isCronCall = authHeader === `Bearer ${process.env.CRON_SECRET}`

  if (!isCronCall) {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const user  = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress ?? ''
    if (!ADMIN_EMAILS.includes(email)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { registrationId } = body as { registrationId?: string }
  if (!registrationId?.trim()) {
    return Response.json({ error: 'registrationId is required' }, { status: 400 })
  }

  // Fetch registration
  const registration = await client.fetch<{
    firstName: string
    lastName: string
    email: string
    workshop: string
    workshopDateId?: string
    cadaNumber?: string
  } | null>(
    `*[_id == $id][0]{ firstName, lastName, email, workshop, workshopDateId, cadaNumber }`,
    { id: registrationId }
  )

  if (!registration) {
    return Response.json({ error: 'Registration not found' }, { status: 404 })
  }

  // Fetch workshop date
  let workshopDate = ''
  if (registration.workshopDateId) {
    const dateDoc = await client.fetch<{ date: string } | null>(
      `*[_id == $id][0]{ date }`,
      { id: registration.workshopDateId }
    )
    workshopDate = dateDoc?.date ?? ''
  }

  try {
    // Generate PDF
    const pdfBuffer = await generateWorkshopCertificate({
      firstName:    registration.firstName,
      lastName:     registration.lastName,
      workshop:     registration.workshop,
      workshopDate: workshopDate,
      cadaNumber:   registration.cadaNumber,
    })

    // Email certificate to registrant
    await resend.emails.send({
      from: 'Western Dental Academy <info@westerndentalacademy.com>',
      to: registration.email,
      subject: `Your Certificate of Attendance — ${registration.workshop}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background-color:#0D3B6E;padding:28px 32px;">
            <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Certificate of Attendance</h1>
            <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
          </div>
          <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
            <p style="color:#0D3B6E;font-size:15px;margin:0 0 16px;">Hi ${registration.firstName},</p>
            <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
              Thank you for attending <strong>${registration.workshop}</strong>. Your certificate of attendance is attached to this email.
            </p>
            <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
              If you have any questions, <a href="https://westerndentalacademy.com/contact" style="color:#378ADD;">contact us here</a>
              or email us at <a href="mailto:info@westerndentalacademy.com" style="color:#378ADD;">info@westerndentalacademy.com</a>.
            </p>
          </div>
          <div style="padding:16px 32px;background-color:#F4F7F9;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `WDA-Certificate-${registration.firstName}-${registration.lastName}.pdf`,
          content: pdfBuffer,
        },
      ],
    })

    // Mark certificate as sent in Sanity
    await client.patch(registrationId).set({ certificateSent: true }).commit()

    return Response.json({ success: true })
  } catch (err) {
    console.error('Workshop certificate error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
