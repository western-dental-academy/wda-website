import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { stripe } from '@/lib/stripe/client'

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

  const { courseId, firstName, lastName, email, phone } = body as {
    courseId?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }

  if (!courseId || !firstName?.trim() || !lastName?.trim() || !email?.trim()) {
    return Response.json({ error: 'courseId, firstName, lastName, and email are required.' }, { status: 400 })
  }

  // Fetch course from Sanity
  const course = await client.fetch<{
    _id: string
    title: string
    price: number
    moodleCourseId: number
    accessDurationDays: number
    hours: number
  } | null>(
    `*[_type == "onlineCourse" && !(_id in path("drafts.**")) && _id == $id && active == true][0]{
      _id, title, price, moodleCourseId, accessDurationDays, hours
    }`,
    { id: courseId }
  )

  if (!course) {
    return Response.json({ error: 'Course not found or not active.' }, { status: 404 })
  }

  const priceCents = Math.round(course.price * 100)

  // Create a pending enrollment in Sanity (status = 'active' set after payment)
  const enrollment = await client.create({
    _type: 'courseEnrollment',
    student: {
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.trim().toLowerCase(),
      phone:     phone?.trim() || undefined,
    },
    course:     { _type: 'reference', _ref: course._id },
    courseName: course.title,
    stripePaymentStatus: 'pending',
    enrolledAt: new Date().toISOString(),
  })

  const origin = req.headers.get('origin') ?? 'https://westerndentalacademy.com'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'cad',
          product_data: {
            name: course.title,
            description: `Online refresher course — ${course.accessDurationDays ?? 365} days access`,
          },
          unit_amount: priceCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      enrollmentId:       enrollment._id,
      courseId:           course._id,
      courseName:         course.title,
      moodleCourseId:     String(course.moodleCourseId),
      accessDurationDays: String(course.accessDurationDays ?? 365),
      courseHours:        String(course.hours ?? 0),
      studentEmail:       email.trim().toLowerCase(),
      studentFirstName:   firstName.trim(),
      studentLastName:    lastName.trim(),
      studentPhone:       phone?.trim() || '',
    },
    customer_email: email.trim().toLowerCase(),
    success_url: `${origin}/courses/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/register`,
  })

  return Response.json({ url: session.url })
}
