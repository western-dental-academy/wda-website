import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { generateStudentIdCard } from '@/lib/idcard/generate'

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
        _id, firstName, lastName, moodleUserId, certificateId,
        status, acceptedDate,
        program->{ title }
      }`,
      { email }
    )

    if (!student) {
      return new Response('Student not found', { status: 404 })
    }

    if (!student.moodleUserId) {
      return new Response('Student not yet provisioned', { status: 403 })
    }

    const studentName = `${student.firstName} ${student.lastName}`
    const programName = student.program?.title ?? 'Dental Assisting Certificate'
    const enrollmentDate = student.acceptedDate
      ? new Date(student.acceptedDate).toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().getFullYear().toString()

    const verificationUrl = student.certificateId
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/verify/${student.certificateId}`
      : 'https://westerndentalacademy.com/portal'

    const pdfBuffer = await generateStudentIdCard(
      studentName,
      programName,
      student.moodleUserId,
      enrollmentDate,
      verificationUrl
    )

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="WDA-ID-${student.firstName}-${student.lastName}.pdf"`,
      },
    })
  } catch (error) {
    console.error('ID card error:', error)
    return new Response('Failed to generate ID card', { status: 500 })
  }
}
