// Clover Hosted Checkout (Ecommerce API) helpers.
// Docs: https://docs.clover.com/dev/docs/hosted-checkout-api
//
// Env vars (entered in Vercel by hand, never committed):
//   CLOVER_PRIVATE_KEY     Ecommerce private token (Hosted Checkout type)
//   CLOVER_MERCHANT_ID     13-character merchant id
//   CLOVER_WEBHOOK_SECRET  Signing secret from the Hosted Checkout settings page
//   CLOVER_ENV             "sandbox" to use the Clover sandbox, anything else = production
import crypto from 'crypto'

function apiBase(): string {
  return process.env.CLOVER_ENV?.trim().toLowerCase() === 'sandbox'
    ? 'https://apisandbox.dev.clover.com'
    : 'https://www.clover.com'
}

export interface CloverLineItem {
  name: string
  price: number // cents
  unitQty: number
  note?: string
}

export interface CloverCheckoutRequest {
  customer: { email?: string; firstName?: string; lastName?: string; phoneNumber?: string }
  lineItems: CloverLineItem[]
  redirectUrls: { success: string; failure: string; cancel: string }
}

export interface CloverCheckoutResponse {
  href: string
  checkoutSessionId: string
  createdTime?: number
  expirationTime?: number
}

export async function cloverCreateCheckout(req: CloverCheckoutRequest): Promise<CloverCheckoutResponse> {
  const key = process.env.CLOVER_PRIVATE_KEY
  const merchantId = process.env.CLOVER_MERCHANT_ID
  if (!key || !merchantId) throw new Error('Clover is not configured (CLOVER_PRIVATE_KEY / CLOVER_MERCHANT_ID missing)')

  // Drop empty customer fields; Clover rejects blank strings on some of them
  const customer = Object.fromEntries(
    Object.entries(req.customer).filter(([, v]) => typeof v === 'string' && v.trim() !== ''),
  )

  const res = await fetch(`${apiBase()}/invoicingcheckoutservice/v1/checkouts`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
      'X-Clover-Merchant-Id': merchantId,
      'User-Agent': 'WDA-Website',
    },
    body: JSON.stringify({
      customer,
      shoppingCart: { lineItems: req.lineItems },
      redirectUrls: req.redirectUrls,
    }),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Clover checkout failed (${res.status}): ${text.slice(0, 500)}`)
  }
  const data = JSON.parse(text) as CloverCheckoutResponse
  if (!data.href || !data.checkoutSessionId) {
    throw new Error(`Clover checkout returned no link: ${text.slice(0, 500)}`)
  }
  return data
}

// Clover-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">
export function verifyCloverSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header || !secret) return false
  const parts = Object.fromEntries(
    header.split(',').map(p => {
      const i = p.indexOf('=')
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()]
    }),
  )
  const t = parts.t
  const v1 = parts.v1
  if (!t || !v1) return false

  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(v1.toLowerCase())
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Webhook body fields (Clover documents them as Created Time, Message, Status,
// Type, Id, MerchantId, Data). Read them case-insensitively to be safe.
export interface CloverWebhookEvent {
  type?: string        // "PAYMENT"
  status?: string      // "APPROVED" | "DECLINED"
  paymentId?: string   // Id: payment UUID
  checkoutSessionId?: string // Data: checkout session UUID
  merchantId?: string
  message?: string
}

// Every string value anywhere in the body. Clover's field names for the
// checkout session id aren't consistent in its docs, so the webhook looks the
// checkout up by any of these.
export function allStringValues(body: unknown, out: string[] = [], depth = 0): string[] {
  if (depth > 5 || body == null) return out
  if (typeof body === 'string') {
    if (body.length >= 8 && body.length <= 100) out.push(body)
  } else if (Array.isArray(body)) {
    for (const v of body) allStringValues(v, out, depth + 1)
  } else if (typeof body === 'object') {
    for (const v of Object.values(body as Record<string, unknown>)) allStringValues(v, out, depth + 1)
  }
  return out
}

export function parseCloverWebhook(body: unknown): CloverWebhookEvent {
  const lower: Record<string, unknown> = {}
  if (body && typeof body === 'object') {
    for (const [k, v] of Object.entries(body as Record<string, unknown>)) lower[k.toLowerCase().replace(/\s+/g, '')] = v
  }
  const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? undefined : String(v))
  return {
    type: str(lower.type)?.toUpperCase(),
    status: str(lower.status)?.toUpperCase(),
    paymentId: str(lower.id),
    checkoutSessionId: str(lower.data),
    merchantId: str(lower.merchantid),
    message: str(lower.message),
  }
}
