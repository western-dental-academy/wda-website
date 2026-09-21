import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { suspendUserEnrollment } from '@/lib/moodle'

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

  const { enrollmentId } = body as { enrollmentId?: string }
  if (!enrollmentId) return NextResponse.json({ error: 'enrollmentId required' }, { status: 400 })

  const enrollment = await client.fetch<{
    _id: string
    moodleUserId?: number
    moodleCourseId?: number
    status: string
  } | null>(
    `*[_type == "courseEnrollment" && !(_id in path("drafts.**")) && _id == $id][0]{
      _id, moodleUserId, status,
      "moodleCourseId": course->moodleCourseId
    }`,
    { id: enrollmentId }
  )

  if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  if (enrollment.status === 'suspended') return NextResponse.json({ error: 'Already suspended' }, { status: 409 })

  try {
    if (enrollment.moodleUserId && enrollment.moodleCourseId) {
      await suspendUserEnrollment(enrollment.moodleUserId, enrollment.moodleCourseId)
    }
    await client.patch(enrollment._id).set({ status: 'suspended' }).commit()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Suspend error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
