import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { createMoodleUser, enrolMoodleUser } from '@/lib/moodle/client'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    // Verify the webhook signature
    const signature = req.headers.get(SIGNATURE_HEADER_NAME) ?? ''
    const body = await req.text()

    const isValid = await isValidSignature(body, signature, WEBHOOK_SECRET)
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const { _id, status, firstName, lastName, email, phone, program } = payload

    // Only act when status changes to 'accepted'
    if (status !== 'accepted') {
      return Response.json({ message: 'No action needed' })
    }

    // Get the program to find the Moodle course ID
    const programDoc = program?._ref
      ? await client.fetch(`*[_id == $id][0]{ moodleCourseId }`, { id: program._ref })
      : null

    const moodleCourseId = programDoc?.moodleCourseId ?? Number(process.env.MOODLE_COURSE_DAC_DD)

    // Create Moodle user
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    const newUsers = await createMoodleUser({
      username: `${username}_${Date.now()}`,
      password: `Wda${Date.now()}!`,
      firstname: firstName,
      lastname: lastName,
      email,
    })

    const moodleUserId = newUsers[0].id

    // Enrol in Moodle course
    await enrolMoodleUser(moodleUserId, moodleCourseId)

    // Store moodleUserId back on Sanity student record
    await client.patch(_id).set({
      moodleUserId,
      acceptedDate: new Date().toISOString(),
    }).commit()

    return Response.json({
      success: true,
      message: `Student ${firstName} ${lastName} provisioned in Moodle`,
      moodleUserId,
    })
  } catch (error) {
    console.error('Sanity webhook error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}