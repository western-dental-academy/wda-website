import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { stripe } from '@/lib/stripe/client'

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
      `*[_type == "student" && email == $email][0]{
        _id, firstName, lastName, email, paymentStatus, tuitionAmount,
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

    // Create or retrieve Stripe customer
    let stripeCustomerId = student.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        name: `${student.firstName} ${student.lastName}`,
        metadata: { sanityStudentId: student._id },
      })
      stripeCustomerId = customer.id
      await client.patch(student._id).set({ stripeCustomerId }).commit()
    }

    
    const processingFee = Math.round((amountInCents + 30) / (1 - 0.029) - amountInCents)

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: student.program?.title ?? 'Dental Assisting Certificate',
              description: 'Western Dental Academy — Tuition Payment',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Payment Processing Fee',
              description: 'Credit/debit card processing fee (2.9% + $0.30)',
            },
            unit_amount: processingFee,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal?payment=cancelled`,
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