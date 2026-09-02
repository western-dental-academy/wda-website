import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { stripe } from '@/lib/stripe/client'

interface CartItemPayload {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  workshopDateId: string
  workshopName: string
  workshopDate: string
  workshopDateISO: string
  workshopDateFormatted: string
  price: number
  dentalBackground: string
  cadaNumber?: string
  pronouns?: string
  mediaConsent?: boolean
  isPrimary: boolean
  deliveryMethod: 'in-person' | 'virtual'
  dietaryRestrictions?: string
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

function calcFee(subtotalCents: number): number {
  return Math.round((subtotalCents + 30) / (1 - 0.033) - subtotalCents)
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { items } = body as { items?: CartItemPayload[] }
    if (!items?.length) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate each item
    for (const item of items) {
      if (!item.firstName?.trim()) return Response.json({ error: 'First name is required for all registrants' }, { status: 400 })
      if (!item.lastName?.trim())  return Response.json({ error: 'Last name is required for all registrants' }, { status: 400 })
      if (!item.email?.trim())     return Response.json({ error: 'Email is required for all registrants' }, { status: 400 })
      if (!item.workshopName)      return Response.json({ error: 'Workshop selection is required for all registrants' }, { status: 400 })
    }

    // Server-side capacity check per unique workshopDateId (in-person only)
    const dateGroups = new Map<string, CartItemPayload[]>()
    for (const item of items) {
      if (!item.workshopDateId) continue
      if (item.deliveryMethod === 'virtual') continue // virtual = unlimited
      const group = dateGroups.get(item.workshopDateId) ?? []
      group.push(item)
      dateGroups.set(item.workshopDateId, group)
    }

    for (const [workshopDateId, dateItems] of dateGroups) {
      const [dateDoc, registeredCount] = await Promise.all([
        client.fetch<{ capacity: number } | null>(
          `*[_type == "workshopDate" && _id == "${workshopDateId}"][0]{ "capacity": offering->capacity }`,
        ),
        client.fetch<number>(
          `count(*[_type == "workshopRegistration" && workshopDateId == "${workshopDateId}" && stripePaymentStatus == "paid" && (deliveryMethod == "in-person" || !defined(deliveryMethod))])`,
        ),
      ])
      const capacity = dateDoc?.capacity ?? 20
      const available = capacity - registeredCount
      if (dateItems.length > available) {
        const workshopName = dateItems[0].workshopName
        return Response.json({
          error: `Not enough spots available for "${workshopName}". Only ${Math.max(0, available)} spot(s) remaining.`,
        }, { status: 400 })
      }
    }

    // Create Sanity registrations (unpaid)
    const now = new Date().toISOString()
    const registrationIds: string[] = []

    for (const item of items) {
      const doc = await client.create({
        _type: 'workshopRegistration',
        firstName: item.firstName.trim(),
        lastName: item.lastName.trim(),
        pronouns: item.pronouns?.trim() || undefined,
        email: item.email.trim(),
        phone: item.phone?.trim() || undefined,
        workshop: item.workshopName,
        preferredDate: item.workshopDateFormatted || 'Contact us for available dates',
        workshopDateId: item.workshopDateId || undefined,
        cadaNumber: item.cadaNumber?.trim() || undefined,
        dentalBackground: item.dentalBackground?.trim() || undefined,
        mediaConsent: item.mediaConsent === true,
        deliveryMethod: item.deliveryMethod,
        dietaryRestrictions: item.dietaryRestrictions?.trim() || undefined,
        stripePaymentStatus: 'unpaid',
        registeredAt: now,
      } as { _type: string; [key: string]: unknown })

      registrationIds.push(doc._id)
    }

    // Pricing
    const subtotalCents = items.reduce((sum, item) => sum + item.price * 100, 0)
    const processingFee = calcFee(subtotalCents)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://westerndentalacademy.com'
    const idsParam = registrationIds.join(',')
    const primaryItem = items.find(i => i.isPrimary) ?? items[0]

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: primaryItem.email,
      line_items: [
        ...items.map(item => ({
          price_data: {
            currency: 'cad',
            product_data: {
              name: `${item.workshopName} — ${item.firstName} ${item.lastName} (${item.deliveryMethod === 'virtual' ? 'Virtual' : 'In-Person'})`,
              description: 'Western Dental Academy — Workshop Registration',
            },
            unit_amount: item.price * 100,
          },
          quantity: 1,
        })),
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Payment Processing Fee',
              description: 'Credit/debit card processing fee (3.3% + $0.30)',
            },
            unit_amount: processingFee,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/register/success?session_id={CHECKOUT_SESSION_ID}&ids=${idsParam}`,
      cancel_url: `${siteUrl}/register?cancelled=1`,
      metadata: {
        registrationIds: idsParam,
        count: String(items.length),
        primaryEmail: primaryItem.email,
      },
    })

    // Store session ID on all registration records
    await Promise.all(
      registrationIds.map(id =>
        client.patch(id).set({ stripeSessionId: session.id }).commit()
      )
    )

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Workshop checkout error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
