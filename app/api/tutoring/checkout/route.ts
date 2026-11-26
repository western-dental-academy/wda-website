import { NextRequest } from 'next/server'
import { createCheckout } from '@/lib/payments/checkout'
import { serviceTitle } from '@/lib/tutoring/shared'
import { getInquiry, siteUrl, tutoringClient } from '@/lib/tutoring/server'

const bad = (error: string, status = 400) => Response.json({ error }, { status })

// POST { id, token } — starts checkout for a payment request staff sent from the WDA Hub
export async function POST(req: NextRequest) {
  let b: { id?: string; token?: string }
  try {
    b = await req.json()
  } catch {
    return bad('Invalid JSON')
  }

  const inquiry = b.id ? await getInquiry(String(b.id)) : null
  if (!inquiry || !inquiry.payToken || inquiry.payToken !== b.token) {
    return bad('This payment link is not valid. Please contact us for a new one.', 404)
  }
  if (inquiry.status === 'paid') return bad('This session has already been paid. Thank you!', 409)
  if (inquiry.status !== 'payment-requested' || !inquiry.amount || !inquiry.hours) {
    return bad('This payment link is no longer active. Please contact us for a new one.', 409)
  }

  try {
    const base = siteUrl()
    const { url, sessionId } = await createCheckout({
      flow: 'tutoring',
      lineItems: [{
        name: `${serviceTitle(inquiry.service)} (${inquiry.hours} hr)`,
        description: inquiry.sessionDetails?.slice(0, 250),
        amountCents: Math.round(inquiry.amount * 100),
      }],
      customerEmail: inquiry.email,
      customer: { firstName: inquiry.firstName, lastName: inquiry.lastName, phone: inquiry.phone },
      metadata: { tutoringInquiryId: inquiry._id },
      successUrl: `${base}/tutoring/success?session_id={SESSION}&id=${inquiry._id}`,
      cancelUrl: `${base}/tutoring/pay/${inquiry._id}?t=${inquiry.payToken}&cancelled=1`,
    })
    await tutoringClient.patch(inquiry._id).set({ checkoutSessionId: sessionId }).commit()
    return Response.json({ url })
  } catch (err) {
    console.error('Tutoring checkout error:', err)
    return bad('Could not start checkout. Please try again.', 500)
  }
}
