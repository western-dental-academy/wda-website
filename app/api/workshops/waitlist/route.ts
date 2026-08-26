import { NextRequest } from 'next/server'
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
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, workshop, workshopDateId } = body

    if (!firstName || !lastName || !email || !workshop || !workshopDateId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Prevent duplicate waitlist entries for same email + date
    const existing = await client.fetch(
      `*[_type == "workshopWaitlist" && email == $email && workshopDateId == $dateId][0]._id`,
      { email, dateId: workshopDateId }
    )
    if (existing) {
      return Response.json({ error: 'You are already on the waitlist for this date.' }, { status: 409 })
    }

    // Fetch date for display in emails
    const workshopDate = await client.fetch<{ date: string } | null>(
      `*[_type == "workshopDate" && _id == $id][0]{ date }`,
      { id: workshopDateId }
    )

    await client.create({
      _type: 'workshopWaitlist',
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      workshop,
      workshopDateId,
      joinedAt: new Date().toISOString(),
      notified: false,
    })

    const dateDisplay = workshopDate?.date
      ? new Date(workshopDate.date).toLocaleDateString('en-CA', {
          timeZone: 'America/Edmonton',
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        })
      : 'TBD'

    // Confirmation to registrant
    resend.emails.send({
      from: 'Western Dental Academy <info@westerndentalacademy.com>',
      to: email,
      subject: `You're on the waitlist — ${workshop}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0D3B6E; padding: 28px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Waitlist Confirmation</h1>
            <p style="color: rgba(255,255,255,0.55); margin: 6px 0 0; font-size: 13px;">Western Dental Academy</p>
          </div>
          <div style="padding: 28px 32px; background: #ffffff; border: 1px solid #e5e7eb;">
            <p style="color: #0D3B6E; font-size: 15px; font-weight: 600; margin: 0 0 16px;">Hi ${firstName},</p>
            <p style="color: #374151; font-size: 14px; margin: 0 0 16px;">
              You've been added to the waitlist for <strong>${workshop}</strong> on ${dateDisplay}.
            </p>
            <p style="color: #374151; font-size: 14px; margin: 0 0 16px;">
              If a spot becomes available, our team will reach out to you directly at this email address.
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              Questions? Contact us at
              <a href="mailto:info@westerndentalacademy.com" style="color: #378ADD;">info@westerndentalacademy.com</a>.
            </p>
          </div>
          <div style="padding: 14px 32px; background: #F4F7F9; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Western Dental Academy — 150 Chippewa Road, Suite 258, Sherwood Park, AB</p>
          </div>
        </div>
      `,
    }).catch((err: Error) => console.error('Waitlist confirmation email failed:', err))

    // Admin notification
    resend.emails.send({
      from: 'Western Dental Academy <info@westerndentalacademy.com>',
      to: 'info@westerndentalacademy.com',
      subject: `New waitlist entry — ${workshop}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0D3B6E; padding: 28px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Waitlist Entry</h1>
            <p style="color: rgba(255,255,255,0.55); margin: 6px 0 0; font-size: 13px;">Western Dental Academy</p>
          </div>
          <div style="padding: 28px 32px; background: #ffffff; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
              <tr><td style="padding: 6px 0; color: #6b7280; width: 120px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${firstName} ${lastName}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0; font-weight: 600;">${email}</td></tr>
              ${phone ? `<tr><td style="padding: 6px 0; color: #6b7280;">Phone</td><td style="padding: 6px 0; font-weight: 600;">${phone}</td></tr>` : ''}
              <tr><td style="padding: 6px 0; color: #6b7280;">Workshop</td><td style="padding: 6px 0; font-weight: 600;">${workshop}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Date</td><td style="padding: 6px 0; font-weight: 600;">${dateDisplay}</td></tr>
            </table>
          </div>
          <div style="padding: 14px 32px; background: #F4F7F9; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Western Dental Academy — 150 Chippewa Road, Suite 258, Sherwood Park, AB</p>
          </div>
        </div>
      `,
    }).catch((err: Error) => console.error('Admin waitlist notification failed:', err))

    return Response.json({ success: true })
  } catch (error) {
    console.error('Waitlist error:', error)
    return Response.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
