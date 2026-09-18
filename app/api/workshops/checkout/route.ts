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
  feedbackShareConsent?: boolean
  newsletterOptIn?: boolean
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

    const { items, giftCode } = body as { items?: CartItemPayload[]; giftCode?: string }
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

    // Duplicate registration check — block same email + same workshopDateId
    const duplicates: Array<{ firstName: string; lastName: string; email: string; workshopDateId: string }> = []
    for (const item of items) {
      if (!item.workshopDateId || !item.email?.trim()) continue
      const existing = await client.fetch<{ _id: string } | null>(
        `*[_type == "workshopRegistration" && !(_id in path("drafts.**")) && email == $email && workshopDateId == $workshopDateId && stripePaymentStatus == "paid"][0]{ _id }`,
        { email: item.email.trim(), workshopDateId: item.workshopDateId },
      )
      if (existing) {
        duplicates.push({
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email.trim(),
          workshopDateId: item.workshopDateId,
        })
      }
    }
    if (duplicates.length > 0) {
      const message = duplicates.length === 1
        ? `A registration already exists for ${duplicates[0].firstName} ${duplicates[0].lastName} (${duplicates[0].email}) for this event date. Please remove them from your cart or choose a different date.`
        : `Registrations already exist for: ${duplicates.map(d => `${d.firstName} ${d.lastName} (${d.email})`).join('; ')}. Please remove them from your cart or choose a different date.`
      return Response.json({ error: 'duplicate', message, duplicates }, { status: 409 })
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
          `count(*[_type == "workshopRegistration" && !(_id in path("drafts.**")) && workshopDateId == "${workshopDateId}" && stripePaymentStatus == "paid" && (deliveryMethod == "in-person" || !defined(deliveryMethod))])`,
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
        feedbackShareConsent: item.feedbackShareConsent === true,
        newsletterOptIn: item.newsletterOptIn === true,
        deliveryMethod: item.deliveryMethod,
        dietaryRestrictions: item.dietaryRestrictions?.trim() || undefined,
        stripePaymentStatus: 'unpaid',
        registeredAt: now,
      } as { _type: string; [key: string]: unknown })

      registrationIds.push(doc._id)
    }

    // Pricing
    const subtotalCents = items.reduce((sum, item) => sum + item.price * 100, 0)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://westerndentalacademy.com'
    const idsParam = registrationIds.join(',')
    const primaryItem = items.find(i => i.isPrimary) ?? items[0]

    // Gift certificate validation
    let giftDiscountCents = 0
    let validatedGiftCode: string | undefined
    let validatedCertId: string | undefined
    let availableBalanceCents = 0

    if (giftCode?.trim()) {
      const normalised = giftCode.trim().toUpperCase()
      const cert = await client.fetch<{
        _id: string; status: string; amount: number; remainingBalance?: number; expiresAt: string; partialRedemptions?: unknown[]
      } | null>(
        `*[_type == "giftCertificate" && !(_id in path("drafts.**")) && code == $code][0]{
          _id, status, amount, remainingBalance, expiresAt, partialRedemptions
        }`,
        { code: normalised }
      )

      if (!cert) return Response.json({ error: 'Gift certificate not found. Please check the code and try again.' }, { status: 400 })
      if (cert.status === 'redeemed') return Response.json({ error: 'This gift certificate has already been redeemed.' }, { status: 400 })
      if (cert.status === 'expired') return Response.json({ error: 'This gift certificate has expired.' }, { status: 400 })
      if (cert.status !== 'active' && cert.status !== 'admin') return Response.json({ error: 'This gift certificate is not valid.' }, { status: 400 })
      if (new Date(cert.expiresAt) < new Date()) return Response.json({ error: 'This gift certificate has expired.' }, { status: 400 })

      const availableBalance = cert.remainingBalance ?? cert.amount
      if (availableBalance <= 0) return Response.json({ error: 'This gift certificate has no remaining balance.' }, { status: 400 })

      availableBalanceCents = Math.round(availableBalance * 100)
      giftDiscountCents = Math.min(availableBalanceCents, subtotalCents)
      validatedGiftCode = normalised
      validatedCertId = cert._id
    }

    // If gift cert covers full amount, mark registrations as paid immediately (no Stripe)
    if (giftDiscountCents >= subtotalCents && validatedGiftCode && validatedCertId) {
      await Promise.all(
        registrationIds.map(id =>
          client.patch(id).set({ stripePaymentStatus: 'paid' }).commit()
        )
      )

      // Update gift certificate balance + add partial redemption entry
      const discountDollars = giftDiscountCents / 100
      const newRemainingBalance = Math.max(0, (availableBalanceCents - giftDiscountCents) / 100)
      const now = new Date().toISOString()
      const workshopName = items.map(i => i.workshopName).filter((v, i, a) => a.indexOf(v) === i).join(', ')

      const currentCert = await client.fetch<{ partialRedemptions?: unknown[] } | null>(
        `*[_type == "giftCertificate" && _id == $id][0]{ partialRedemptions }`,
        { id: validatedCertId }
      )
      const currentRedemptions: unknown[] = currentCert?.partialRedemptions ?? []

      await client.patch(validatedCertId).set({
        remainingBalance: newRemainingBalance,
        status: newRemainingBalance === 0 ? 'redeemed' : 'active',
        ...(newRemainingBalance === 0 ? { redeemedAt: now, redeemedBy: primaryItem.email } : {}),
        partialRedemptions: [
          ...currentRedemptions,
          {
            _key: `free-${Date.now()}`,
            redeemedAt: now,
            redeemedBy: primaryItem.email,
            amountUsed: discountDollars,
            remainingAfter: newRemainingBalance,
            workshopName,
          },
        ],
      }).commit()

      return Response.json({
        free: true,
        successUrl: `${siteUrl}/register/success?ids=${idsParam}&gift_redeemed=1`,
      })
    }

    // Partial or no gift cert — go through Stripe
    const remainingCents = subtotalCents - giftDiscountCents
    const processingFee = calcFee(remainingCents)

    // Build line items
    const lineItems: any[] = []

    if (giftDiscountCents > 0 && validatedGiftCode) {
      // Single line item for the discounted total
      lineItems.push({
        price_data: {
          currency: 'cad',
          product_data: {
            name: items.length === 1
              ? `${items[0].workshopName} — ${items[0].firstName} ${items[0].lastName}`
              : `Workshop Registration (${items.length} attendees)`,
            description: `Gift certificate ${validatedGiftCode} applied (-$${giftDiscountCents / 100} CAD)`,
          },
          unit_amount: remainingCents,
        },
        quantity: 1,
      })
    } else {
      items.forEach(item => {
        lineItems.push({
          price_data: {
            currency: 'cad',
            product_data: {
              name: `${item.workshopName} — ${item.firstName} ${item.lastName} (${item.deliveryMethod === 'virtual' ? 'Virtual' : 'In-Person'})`,
              description: 'Western Dental Academy — Workshop Registration',
            },
            unit_amount: item.price * 100,
          },
          quantity: 1,
        })
      })
    }

    lineItems.push({
      price_data: {
        currency: 'cad',
        product_data: {
          name: 'Payment Processing Fee',
          description: 'Credit/debit card processing fee (3.3% + $0.30)',
        },
        unit_amount: processingFee,
      },
      quantity: 1,
    })

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: primaryItem.email,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/register/success?session_id={CHECKOUT_SESSION_ID}&ids=${idsParam}`,
      cancel_url: `${siteUrl}/register?cancelled=1`,
      metadata: {
        registrationIds: idsParam,
        count: String(items.length),
        primaryEmail: primaryItem.email,
        ...(validatedGiftCode ? {
          giftCode: validatedGiftCode,
          giftDiscountDollars: String(giftDiscountCents / 100),
          giftNewRemainingBalance: String(Math.max(0, (availableBalanceCents - giftDiscountCents) / 100)),
        } : {}),
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
