import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const sanityStudentId = session.metadata?.sanityStudentId

        if (!sanityStudentId) break

        // Update student payment status in Sanity
        await client.patch(sanityStudentId).set({
          paymentStatus: 'paid',
          stripePaymentIntentId: session.payment_intent as string,
        }).commit()

        console.log(`Payment confirmed for student ${sanityStudentId}`)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object
        const sanityStudentId = session.metadata?.sanityStudentId

        if (!sanityStudentId) break

        await client.patch(sanityStudentId).set({
          paymentStatus: 'unpaid',
        }).commit()

        break
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`)
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook processing error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}