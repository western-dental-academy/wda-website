import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { createCheckout } from '@/lib/payments/checkout'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { enrollmentId } = body as { enrollmentId?: string }
  if (!enrollmentId?.trim()) {
    return Response.json({ error: 'enrollmentId is required.' }, { status: 400 })
  }

  const enrollment = await client.fetch<{
    _id: string
    courseName: string
    status: string
    student: { email: string; firstName: string }
    course: { _ref: string }
  } | null>(
    `*[_type == "courseEnrollment" && !(_id in path("drafts.**")) && _id == $id][0]{
      _id, courseName, status,
      student{ email, firstName },
      course{ _ref }
    }`,
    { id: enrollmentId }
  )

  if (!enrollment) {
    return Response.json({ error: 'Enrollment not found.' }, { status: 404 })
  }

  // Fetch course price + duration
  const course = await client.fetch<{ price: number; accessDurationDays: number } | null>(
    `*[_type == "onlineCourse" && !(_id in path("drafts.**")) && _id == $id][0]{ price, accessDurationDays }`,
    { id: enrollment.course._ref }
  )

  if (!course) {
    return Response.json({ error: 'Course not found.' }, { status: 404 })
  }

  const origin = req.headers.get('origin') ?? 'https://westerndentalacademy.com'

  const session = await createCheckout({
    flow: 'course-extension',
    lineItems: [
      {
        name: `${enrollment.courseName} — Access Extension`,
        description: `${course.accessDurationDays ?? 365} additional days of access`,
        amountCents: Math.round(course.price * 100),
      },
    ],
    customer: { firstName: enrollment.student.firstName },
    metadata: {
      type:                'course_extension',
      enrollmentId:        enrollment._id,
      accessDurationDays:  String(course.accessDurationDays ?? 365),
      courseName:          enrollment.courseName,
    },
    customerEmail: enrollment.student.email,
    successUrl: `${origin}/courses/extend/success?session_id={SESSION}`,
    cancelUrl:  `${origin}/staff`,
  })

  return Response.json({ url: session.url })
}
