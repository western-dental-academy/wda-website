import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { stripe } from '@/lib/stripe/client'
import { activeProvider, createCheckout } from '@/lib/payments/checkout'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress

    // Fetch student record
    const student = await client.fetch(
      `*[_type == "student" && !(_id in path("drafts.**")) && email == $email][0]{
        _id, firstName, lastName, email, paymentStatus, tuitionAmount, stripeCustomerId,
        program->{ title }
      }`,
      { email }
    )

    if (!student) {
      return Response.json({ error: 'Student record not found' }, { status: 404 })
    }

    if (student.paymentStatus === 'paid') {
      return Response.json({ error: 'Tuition already paid' }, { status: 400 })
    }

    const tuitionAmount = student.tuitionAmount ?? 2500
    const amountInCents = Math.round(tuitionAmount * 100)

    // Create or retrieve Stripe customer (Stripe only)
    let stripeCustomerId = student.stripeCustomerId
    if (!stripeCustomerId && activeProvider() === 'stripe') {
      const customer = await stripe.customers.create({
        email,
        name: `${student.firstName} ${student.lastName}`,
        metadata: { sanityStudentId: student._id },
      })
      stripeCustomerId = customer.id
      await client.patch(student._id).set({ stripeCustomerId }).commit()
    }

    

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://westerndentalacademy.com'
    const session = await createCheckout({
      flow: 'tuition',
      stripeCustomerId: stripeCustomerId || undefined,
      customerEmail: email,
      customer: { firstName: student.firstName, lastName: student.lastName },
      lineItems: [
        {
          name: student.program?.title ?? 'Dental Assisting Certificate',
          description: 'Western Dental Academy — Tuition Payment',
          amountCents: amountInCents,
        },
      ],
      successUrl: `${siteUrl}/portal?payment=success`,
      cancelUrl: `${siteUrl}/portal?payment=cancelled`,
      metadata: {
        sanityStudentId: student._id,
      },
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}