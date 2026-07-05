import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

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
    } = body

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