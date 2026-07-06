import { NextRequest } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, topic, message } = await req.json()

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'Western Dental Academy <info@westerndentalacademy.com>',
      to: 'info@westerndentalacademy.com',
      replyTo: email,
      subject: `Contact Form: ${topic || 'General Inquiry'} — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1E3560; padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Contact Form Submission</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 14px;">Western Dental Academy Website</p>
          </div>
          
          <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; width: 120px;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1E3560; font-size: 13px; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px;"><a href="mailto:${email}" style="color: #378ADD;">${email}</a></td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Phone</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1E3560; font-size: 13px;">${phone}</td>
              </tr>
              ` : ''}
              ${topic ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Topic</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1E3560; font-size: 13px;">${topic}</td>
              </tr>
              ` : ''}
            </table>

            <div style="margin-top: 24px;">
              <p style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">Message</p>
              <div style="background-color: #F4F7F9; padding: 16px; border-radius: 8px; color: #1E3560; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            </div>
          </div>

          <div style="padding: 16px 32px; background-color: #F4F7F9; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Reply directly to this email to respond to ${name}</p>
          </div>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }
}