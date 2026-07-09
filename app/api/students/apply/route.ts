import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { applyRatelimit } from '@/lib/ratelimit'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await applyRatelimit.limit(ip)
  if (!success) {
    return Response.json(
      { error: 'Too many requests. Please try again in a few minutes.' },
      { status: 429 }
    )
  }

  // Parse body
  const { recaptchaToken, ...formData } = await req.json()

  // Verify reCAPTCHA
  if (recaptchaToken && process.env.NODE_ENV === 'production') {
  const recaptchaRes = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    { method: 'POST' }
  )
  const recaptchaData = await recaptchaRes.json()

  if (!recaptchaData.success || recaptchaData.score < 0.5) {
    return Response.json(
      { error: 'reCAPTCHA verification failed. Please try again.' },
      { status: 400 }
    )
  }
}

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      education,
      educationYear,
      experience,
      program,
      startDate,
      referral,
      transcriptAssetId,
    } = formData

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !program) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save to Sanity
    const student = await client.create({
      _type: 'student',
      firstName,
      lastName,
      email,
      phone,
      status: 'pending',
      applicationDate: new Date().toISOString(),
      ...(transcriptAssetId ? {
        transcriptFile: {
          _type: 'file',
          asset: { _type: 'reference', _ref: transcriptAssetId },
        },
      } : {}),
      notes: [
        `Date of Birth: ${dob}`,
        `Education: ${education} (${educationYear})`,
        experience ? `Experience: ${experience}` : null,
        `Program Interest: ${program}`,
        `Preferred Start: ${startDate}`,
        `Referral: ${referral}`,
      ]
        .filter(Boolean)
        .join('\n'),
    })

    // Notify admin of new application
    await resend.emails.send({
      from: 'Western Dental Academy <info@westerndentalacademy.com>',
      to: 'info@westerndentalacademy.com',
      subject: `New Application: ${firstName} ${lastName} — ${program}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1E3560; padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Student Application</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 14px;">Western Dental Academy</p>
          </div>
          
          <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e5e7eb;">
            <p style="color: #1E3560; font-size: 15px; margin-bottom: 24px;">A new application has been submitted and is awaiting review.</p>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; width: 140px;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1E3560; font-size: 13px; font-weight: 600;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px;"><a href="mailto:${email}" style="color: #378ADD;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Phone</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1E3560; font-size: 13px;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Programme</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1E3560; font-size: 13px;">${program}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Preferred Start</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1E3560; font-size: 13px;">${startDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Referral</td>
                <td style="padding: 10px 0; color: #1E3560; font-size: 13px;">${referral}</td>
              </tr>
            </table>

            <div style="margin-top: 28px;">
              <a href="https://westerndentalacademy.com/studio/structure/students" 
                 style="background-color: #E67E22; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                Review Application in Sanity Studio
              </a>
            </div>
          </div>

          <div style="padding: 16px 32px; background-color: #F4F7F9; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Western Dental Academy — westerndentalacademy.com</p>
          </div>
        </div>
      `,
    })

    return Response.json({ success: true, studentId: student._id })
  } catch (error) {
    console.error('Apply API error:', error)
    return Response.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}