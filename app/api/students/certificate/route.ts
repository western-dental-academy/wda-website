import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { getMoodleProgress } from '@/lib/moodle/client'
import { generateCertificate } from '@/lib/certificate/generate'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

function generateCertificateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const year = new Date().getFullYear()
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `WDA-${year}-${code}`
}

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
        _id, firstName, lastName, moodleUserId, certificateId,
        program->{ title, moodleCourseId }
      }`,
      { email }
    )

    if (!student) {
      return new Response('Student not found', { status: 404 })
    }

    const moodleCourseId = student.program?.moodleCourseId ?? Number(process.env.MOODLE_COURSE_DAC_DD)

    // Check completion
    const progress = await getMoodleProgress(student.moodleUserId, moodleCourseId)
    const completed = progress?.statuses?.every((s: any) => s.state === 1)

    if (!completed) {
      return new Response('Course not yet complete', { status: 403 })
    }

    // Generate or reuse certificate ID
    let certificateId = student.certificateId
    if (!certificateId) {
      certificateId = generateCertificateId()
      await client.patch(student._id).set({
        certificateId,
        certificateIssuedDate: new Date().toISOString(),
      }).commit()
    }

    const studentName = `${student.firstName} ${student.lastName}`
    const programName = student.program?.title ?? 'Dental Assisting Certificate'
    const completionDate = new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify/${certificateId}`

    const pdfBuffer = await generateCertificate(studentName, programName, completionDate, certificateId, verificationUrl)

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="WDA-Certificate-${student.firstName}-${student.lastName}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Certificate error:', error)
    return new Response('Failed to generate certificate', { status: 500 })
  }
}