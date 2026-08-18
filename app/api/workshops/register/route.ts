import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { stripe } from '@/lib/stripe/client'

const WORKSHOP_PRICES: Record<string, number> = {
  'NDAB Skills Refresher Workshop': 299,
  'Dental Practice Software Masterclass': 249,
  'Front Office Excellence Workshop': 199,
  'Ergonomics & Career Longevity Workshop': 199,
  'Inventory & Supply Management Workshop': 199,
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { firstName, lastName, email, phone, workshop, preferredDate, questions } = body as {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
      workshop?: string
      preferredDate?: string
      questions?: string
    }

    if (!firstName?.trim()) return Response.json({ error: 'First name is required' }, { status: 400 })
    if (!lastName?.trim())  return Response.json({ error: 'Last name is required' }, { status: 400 })
    if (!email?.trim())     return Response.json({ error: 'Email is required' }, { status: 400 })
    if (!phone?.trim())     return Response.json({ error: 'Phone is required' }, { status: 400 })
    if (!workshop?.trim())  return Response.json({ error: 'Workshop selection is required' }, { status: 400 })

    const price = WORKSHOP_PRICES[workshop]
    if (!price) return Response.json({ error: 'Invalid workshop selection' }, { status: 400 })

    // Save registration to Sanity (unpaid — payment status updated on success page)
    const registration = await client.create({
      _type: 'workshopRegistration',
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      workshop,
      preferredDate: preferredDate ?? 'Contact us for available dates',
      questions: questions?.trim() || undefined,
      stripePaymentStatus: 'unpaid',
      registeredAt: new Date().toISOString(),
    } as { _type: string; [key: string]: unknown })

    const amountInCents = price * 100
    const processingFee = Math.round((amountInCents + 30) / (1 - 0.029) - amountInCents)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://westerndentalacademy.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email.trim(),
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: workshop,
              description: 'Western Dental Academy — Workshop Registration',
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
      success_url: `${siteUrl}/register/success?session_id={CHECKOUT_SESSION_ID}&id=${registration._id}`,
      cancel_url: `${siteUrl}/register?cancelled=1`,
      metadata: {
        sanityRegistrationId: registration._id,
        workshop,
      },
    })

    // Store session ID on the registration record
    await client.patch(registration._id).set({ stripeSessionId: session.id }).commit()

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Workshop register error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
