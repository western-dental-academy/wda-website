import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { getMoodleProgress } from '@/lib/moodle/client'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
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

export async function GET(req: NextRequest) {
  // Auth
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Admin whitelist
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const studentId = req.nextUrl.searchParams.get('studentId')
  if (!studentId) {
    return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
  }

  // Fetch student record for Moodle IDs
  const student = await client.fetch(
    `*[_type == "student" && _id == $studentId][0]{
      moodleUserId,
      program->{ moodleCourseId }
    }`,
    { studentId }
  )

  if (!student?.moodleUserId) {
    return NextResponse.json({ provisioned: false, completedCount: 0, totalCount: 0, progressPct: 0 })
  }

  const moodleCourseId =
    student.program?.moodleCourseId ?? Number(process.env.MOODLE_COURSE_DAC_DD)

  try {
    const progress = await getMoodleProgress(student.moodleUserId, moodleCourseId)
    const statuses: { state: number }[] = progress?.statuses ?? []
    const completedCount = statuses.filter((s) => s.state === 1).length
    const totalCount = statuses.length
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return NextResponse.json({ provisioned: true, completedCount, totalCount, progressPct })
  } catch (err) {
    console.error('Moodle progress fetch error:', err)
    return NextResponse.json({ error: 'Moodle unavailable' }, { status: 502 })
  }
}
