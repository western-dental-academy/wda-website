import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { getMoodleProgress, getMoodleGrades, getMoodleCourseContents } from '@/lib/moodle/client'
import { generateTranscript } from '@/lib/transcript/generate'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response('Unauthorised', { status: 401 })
    }

    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress

    const student = await client.fetch(
      `*[_type == "student" && email == $email][0]{
        _id, firstName, lastName, email, moodleUserId,
        acceptedDate, cohort,
        program->{ title, moodleCourseId }
      }`,
      { email }
    )

    if (!student) {
      return new Response('Student not found', { status: 404 })
    }

    const moodleCourseId = student.program?.moodleCourseId ?? Number(process.env.MOODLE_COURSE_DAC_DD)

    const [progress, grades, courseContents] = await Promise.all([
      getMoodleProgress(student.moodleUserId, moodleCourseId),
      getMoodleGrades(student.moodleUserId, moodleCourseId),
      getMoodleCourseContents(moodleCourseId),
    ])

    // Build activity name map
    const activityNames: Record<number, string> = {}
    if (courseContents) {
      for (const section of courseContents) {
        for (const mod of section.modules ?? []) {
          activityNames[mod.id] = mod.name
        }
      }
    }

    const gradeItems = grades?.usergrades?.[0]?.gradeitems ?? []
    const progressStatuses = progress?.statuses ?? []

    const enrollmentDate = student.acceptedDate
      ? new Date(student.acceptedDate).toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A'

    const pdfBuffer = await generateTranscript(
      {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        program: student.program?.title ?? 'Dental Assisting Certificate',
        enrollmentDate,
        cohort: student.cohort,
      },
      gradeItems,
      activityNames,
      progressStatuses,
    )

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="WDA-Transcript-${student.firstName}-${student.lastName}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Transcript error:', error)
    return new Response('Failed to generate transcript', { status: 500 })
  }
}