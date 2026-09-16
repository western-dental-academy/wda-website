import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/client'
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: recipientEmail.trim(),
      line_items: [
        {
          price_data: {
            currency: 'cad',
            unit_amount: amount * 100,
            product_data: {
              name: `WDA Gift Certificate — $${amount} CAD`,
              description: `From ${senderName.trim()} to ${recipientName.trim()} · Western Dental Academy Professional Development`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/gift-certificates/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/gift-certificates`,
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
