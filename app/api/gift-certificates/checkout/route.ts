import { NextRequest } from 'next/server'
import { createCheckout } from '@/lib/payments/checkout'
import { generateGiftCode } from '@/lib/giftCertificates'

export async function POST(req: NextRequest) {
  try {
    let body: unknown
    try { body = await req.json() } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { amount, recipientName, recipientEmail, senderName, message } =
      body as {
        amount?: number
        recipientName?: string
        recipientEmail?: string
        senderName?: string
        message?: string
      }

    if (!recipientName?.trim()) return Response.json({ error: 'Recipient name is required' }, { status: 400 })
    if (!recipientEmail?.trim()) return Response.json({ error: 'Recipient email is required' }, { status: 400 })
    if (!senderName?.trim()) return Response.json({ error: 'Sender name is required' }, { status: 400 })
    if (!amount || amount < 40 || amount > 750) {
      return Response.json({ error: 'Amount must be between $40 and $750 CAD' }, { status: 400 })
    }

    const code = generateGiftCode()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://westerndentalacademy.com'

    // Stripe keeps the old behaviour (recipient email prefilled); on Clover the
    // buyer types their own email on the payment page.
    const session = await createCheckout({
      flow: 'gift-certificate',
      customerEmail: recipientEmail.trim(),
      lineItems: [
        {
          name: `WDA Gift Certificate — $${amount} CAD`,
          description: `From ${senderName.trim()} to ${recipientName.trim()} · Western Dental Academy Professional Development`,
          amountCents: Math.round(amount * 100),
        },
      ],
      successUrl: `${siteUrl}/gift-certificates/success?session_id={SESSION}`,
      cancelUrl: `${siteUrl}/gift-certificates`,
      metadata: {
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        senderName: senderName.trim(),
        message: (message ?? '').slice(0, 500),
        code,
        amount: String(amount),
      },
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Gift certificate checkout error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
