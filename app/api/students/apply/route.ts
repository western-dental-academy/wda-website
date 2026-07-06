import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { applyRatelimit } from '@/lib/ratelimit'

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

    return Response.json({ success: true, studentId: student._id })
  } catch (error) {
    console.error('Apply API error:', error)
    return Response.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}