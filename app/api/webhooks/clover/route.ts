// Clover Hosted Checkout webhook. Clover has no API to look up a checkout
// afterwards, so this is how the site learns a payment went through.
// Set this URL in Clover: Account & Setup → Ecommerce → Hosted Checkout → Webhook URL.
import { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { parseCloverWebhook, verifyCloverSignature } from '@/lib/payments/clover'
import { paymentsClient, getPaymentCheckoutDoc, toCheckoutSession } from '@/lib/payments/checkout'
import { fulfilCheckout } from '@/lib/payments/fulfil'

export const maxDuration = 60

const resend = new Resend(process.env.RESEND_API_KEY)

async function alertStaff(subject: string, detail: string) {
  try {
    await resend.emails.send({
      from: 'Western Dental Academy <info@westerndentalacademy.com>',
      to: 'aiden@westerndentalacademy.com',
      subject,
      html: `<p>${detail.replace(/</g, '&lt;')}</p>`,
    })
  } catch (err) {
    console.error('Clover webhook alert email failed:', err)
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text()

  const secret = process.env.CLOVER_WEBHOOK_SECRET ?? ''
  if (!verifyCloverSignature(raw, req.headers.get('clover-signature'), secret)) {
    console.error('Clover webhook: bad or missing signature')
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: unknown
  try { body = JSON.parse(raw) } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const event = parseCloverWebhook(body)
  console.log('Clover webhook:', event.type, event.status, event.checkoutSessionId)

  if (event.merchantId && process.env.CLOVER_MERCHANT_ID && event.merchantId !== process.env.CLOVER_MERCHANT_ID) {
    console.error('Clover webhook for another merchant:', event.merchantId)
    return Response.json({ received: true })
  }
  if (event.type && event.type !== 'PAYMENT') return Response.json({ received: true })
  if (!event.checkoutSessionId) return Response.json({ received: true })

  const docId = await paymentsClient.fetch<string | null>(
    `*[_type == "paymentCheckout" && cloverCheckoutSessionId == $sid && !(_id in path("drafts.**"))][0]._id`,
    { sid: event.checkoutSessionId },
  )
  if (!docId) {
    // e.g. a payment link made in the Clover dashboard, not by the website
    console.log('Clover webhook: no website checkout for session', event.checkoutSessionId)
    return Response.json({ received: true })
  }

  if (event.status !== 'APPROVED') {
    await paymentsClient.patch(docId).set({ lastWebhookMessage: `${event.status ?? ''} ${event.message ?? ''}`.trim().slice(0, 300) }).commit()
    return Response.json({ received: true })
  }

  const existing = await getPaymentCheckoutDoc(docId)
  if (existing && existing.status !== 'paid') {
    await paymentsClient.patch(docId).set({
      status: 'paid',
      paidAt: new Date().toISOString(),
      cloverPaymentId: event.paymentId,
      lastWebhookMessage: (event.message ?? 'APPROVED').slice(0, 300),
    }).commit()
  }

  const doc = await getPaymentCheckoutDoc(docId)
  if (!doc) return Response.json({ received: true })

  try {
    await fulfilCheckout(toCheckoutSession(doc))
  } catch (err) {
    console.error('Clover fulfilment error:', err)
    await paymentsClient.patch(docId).set({ error: String(err).slice(0, 1000) }).commit()
    await alertStaff(
      'Website payment needs attention (Clover)',
      `A Clover payment was approved but the website could not finish processing it. Payment record: ${docId} (${doc.flow}, ${doc.customerEmail ?? 'no email'}). Error: ${String(err)}`,
    )
    // 500 so Clover retries; fulfilment is safe to run again
    return Response.json({ error: 'Fulfilment failed' }, { status: 500 })
  }

  return Response.json({ received: true })
}
