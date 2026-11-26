// Provider-neutral checkout. Every payment flow on the site creates its
// checkout through createCheckout() and reads it back through
// getCheckoutSession(), so the card processor can be switched with the
// PAYMENT_PROVIDER env var ("stripe" by default, or "clover").
//
// Stripe keeps the order details in session metadata and can be asked later
// whether a session was paid. Clover Hosted Checkout can do neither, so for
// Clover the details live on a `paymentCheckout` Sanity doc, and the Clover
// webhook marks that doc paid. The doc's _id stands in for the session id in
// success-page URLs.
import { createClient } from '@sanity/client'
import { stripe } from '@/lib/stripe/client'
import { cloverCreateCheckout } from './clover'

export type PaymentProvider = 'stripe' | 'clover'

export type CheckoutFlow =
  | 'workshops'
  | 'workshop-legacy'
  | 'course'
  | 'course-extension'
  | 'gift-certificate'
  | 'invigilation'
  | 'tuition'
  | 'tutoring'

export interface CheckoutLineItem {
  name: string
  description?: string
  amountCents: number
}

export interface CreateCheckoutOptions {
  flow: CheckoutFlow
  lineItems: CheckoutLineItem[]
  customerEmail?: string
  customer?: { firstName?: string; lastName?: string; phone?: string }
  metadata: Record<string, string>
  // Absolute URL. "{SESSION}" is replaced with the checkout/session id.
  successUrl: string
  cancelUrl: string
  // Stripe only (Clover sessions always expire after 15 minutes)
  stripeExpiresAt?: number
  // Stripe only: attach to an existing Stripe customer
  stripeCustomerId?: string
}

export interface CheckoutSession {
  id: string
  provider: PaymentProvider
  paid: boolean
  flow?: CheckoutFlow
  metadata: Record<string, string>
  amountTotalCents: number
  // Stripe payment intent id, or Clover payment id
  paymentRef?: string
  customerEmail?: string
}

export const paymentsClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export function activeProvider(): PaymentProvider {
  return process.env.PAYMENT_PROVIDER?.trim().toLowerCase() === 'clover' ? 'clover' : 'stripe'
}

export function providerLabel(): string {
  return activeProvider() === 'clover' ? 'Clover' : 'Stripe'
}

// While Stripe is still the default, checkouts for the emails listed in
// CLOVER_TEST_EMAILS (comma-separated) go through Clover, so live Clover
// payments can be tested without switching every customer over.
function isCloverTester(email?: string): boolean {
  if (!email) return false
  const list = (process.env.CLOVER_TEST_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return list.includes(email.trim().toLowerCase())
}

export async function createCheckout(opts: CreateCheckoutOptions): Promise<{ url: string; sessionId: string; provider: PaymentProvider }> {
  if (activeProvider() === 'clover' || isCloverTester(opts.customerEmail)) return createCloverCheckout(opts)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    ...(opts.stripeCustomerId
      ? { customer: opts.stripeCustomerId }
      : opts.customerEmail ? { customer_email: opts.customerEmail } : {}),
    line_items: opts.lineItems.map(li => ({
      price_data: {
        currency: 'cad',
        product_data: { name: li.name, ...(li.description ? { description: li.description } : {}) },
        unit_amount: li.amountCents,
      },
      quantity: 1,
    })),
    ...(opts.stripeExpiresAt ? { expires_at: opts.stripeExpiresAt } : {}),
    success_url: opts.successUrl.replace('{SESSION}', '{CHECKOUT_SESSION_ID}'),
    cancel_url: opts.cancelUrl,
    metadata: { ...opts.metadata, flow: opts.flow },
  })
  return { url: session.url!, sessionId: session.id, provider: 'stripe' }
}

async function createCloverCheckout(opts: CreateCheckoutOptions) {
  const amountTotalCents = opts.lineItems.reduce((s, li) => s + li.amountCents, 0)
  const doc = await paymentsClient.create({
    _type: 'paymentCheckout',
    provider: 'clover',
    flow: opts.flow,
    status: 'pending',
    amountTotalCents,
    customerEmail: opts.customerEmail,
    description: opts.lineItems.map(li => li.name).join(' + ').slice(0, 300),
    metadataJson: JSON.stringify(opts.metadata),
    createdAt: new Date().toISOString(),
  })

  try {
    const res = await cloverCreateCheckout({
      customer: {
        email: opts.customerEmail,
        firstName: opts.customer?.firstName,
        lastName: opts.customer?.lastName,
        phoneNumber: opts.customer?.phone,
      },
      lineItems: opts.lineItems.map(li => ({
        name: li.name.slice(0, 127),
        price: li.amountCents,
        unitQty: 1,
        ...(li.description ? { note: li.description.slice(0, 255) } : {}),
      })),
      redirectUrls: {
        success: opts.successUrl.replace('{SESSION}', doc._id),
        failure: opts.cancelUrl,
        cancel: opts.cancelUrl,
      },
    })
    await paymentsClient.patch(doc._id).set({ cloverCheckoutSessionId: res.checkoutSessionId }).commit()
    return { url: res.href, sessionId: doc._id, provider: 'clover' as const }
  } catch (err) {
    await paymentsClient.patch(doc._id).set({ status: 'failed', error: String(err).slice(0, 1000) }).commit()
    throw err
  }
}

interface PaymentCheckoutDoc {
  _id: string
  _rev: string
  flow?: CheckoutFlow
  status: 'pending' | 'paid' | 'declined' | 'failed'
  amountTotalCents?: number
  customerEmail?: string
  metadataJson?: string
  cloverPaymentId?: string
  fulfilmentClaimedAt?: string
  fulfilledAt?: string
}

export async function getPaymentCheckoutDoc(id: string): Promise<PaymentCheckoutDoc | null> {
  return paymentsClient.fetch<PaymentCheckoutDoc | null>(
    `*[_type == "paymentCheckout" && _id == $id && !(_id in path("drafts.**"))][0]`,
    { id },
  )
}

export function toCheckoutSession(doc: PaymentCheckoutDoc): CheckoutSession {
  let metadata: Record<string, string> = {}
  try { metadata = JSON.parse(doc.metadataJson ?? '{}') } catch { /* keep empty */ }
  return {
    id: doc._id,
    provider: 'clover',
    paid: doc.status === 'paid',
    flow: doc.flow,
    metadata,
    amountTotalCents: doc.amountTotalCents ?? 0,
    paymentRef: doc.cloverPaymentId,
    customerEmail: doc.customerEmail,
  }
}

// Stripe session ids start with "cs_"; anything else is a paymentCheckout doc id.
export async function getCheckoutSession(id: string): Promise<CheckoutSession | null> {
  if (id.startsWith('cs_')) {
    const s = await stripe.checkout.sessions.retrieve(id)
    const metadata = (s.metadata ?? {}) as Record<string, string>
    return {
      id: s.id,
      provider: 'stripe',
      paid: s.payment_status === 'paid',
      flow: metadata.flow as CheckoutFlow | undefined,
      metadata,
      amountTotalCents: s.amount_total ?? 0,
      paymentRef: (s.payment_intent as string | null) ?? undefined,
      customerEmail: s.customer_details?.email ?? s.customer_email ?? undefined,
    }
  }
  const doc = await getPaymentCheckoutDoc(id)
  return doc ? toCheckoutSession(doc) : null
}

// Clover payments are fulfilled by both the webhook and the success page,
// often within a second of each other. Only the first caller runs `fn` for
// real; a second caller waits for it to finish and then runs `fn` again, which
// lands on each flow's "already processed" branch and just returns the result.
// Stripe sessions keep the existing behaviour (no lock).
export async function runFulfilmentOnce<T>(session: CheckoutSession, fn: () => Promise<T>): Promise<T> {
  if (session.provider !== 'clover') return fn()

  const doc = await getPaymentCheckoutDoc(session.id)
  if (!doc) return fn()
  if (doc.fulfilledAt) return fn()

  if (!doc.fulfilmentClaimedAt) {
    let claimed = false
    try {
      await paymentsClient.patch(doc._id).ifRevisionId(doc._rev)
        .set({ fulfilmentClaimedAt: new Date().toISOString() }).commit()
      claimed = true
    } catch { /* someone else claimed it */ }
    if (claimed) {
      const result = await fn()
      await paymentsClient.patch(doc._id).set({ fulfilledAt: new Date().toISOString() }).commit()
      return result
    }
  }

  // Wait (up to ~20s) for the other caller to finish
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1000))
    const d = await getPaymentCheckoutDoc(session.id)
    if (d?.fulfilledAt) break
  }
  return fn()
}
