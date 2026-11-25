// Gift certificate purchase fulfilment: creates the certificate, emails the
// PDF to the recipient and a receipt to the buyer. Shared by
// /gift-certificates/success and the payment webhooks. Safe to call more than once.
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { getExpiryDate, formatExpiryDisplay } from '@/lib/giftCertificates'
import { generateGiftCertPdf } from '@/lib/giftCertificatePdf'
import type { CheckoutSession } from '@/lib/payments/checkout'
import fs from 'fs'
import path from 'path'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const resend = new Resend(process.env.RESEND_API_KEY)

function giftEmailHtml(recipientName: string, senderName: string, amount: number, message: string | undefined, code: string, expiresAt: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background-color:#0D3B6E;padding:28px 32px;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">You've Received a Gift Certificate!</h1>
        <p style="color:rgba(255,255,255,0.55);margin:6px 0 0;font-size:13px;">Western Dental Academy</p>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
        <p style="color:#0D3B6E;font-size:15px;font-weight:600;margin:0 0 8px;">Hi ${recipientName},</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
          <strong>${senderName}</strong> has sent you a Western Dental Academy gift certificate worth <strong>$${amount} CAD</strong> towards your professional development!
        </p>
        ${message ? `
        <div style="background:#F4F7F9;border-left:4px solid #E67E22;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
          <p style="color:#6b7280;font-size:11px;font-weight:600;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">Personal message</p>
          <p style="color:#374151;font-size:14px;font-style:italic;margin:0;">&ldquo;${message}&rdquo;</p>
        </div>` : ''}
        <div style="background:#0D3B6E;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Certificate Value</p>
          <p style="color:#E67E22;font-size:40px;font-weight:700;margin:0 0 16px;line-height:1;">$${amount} <span style="font-size:16px;color:rgba(255,255,255,0.5);">CAD</span></p>
          <p style="color:rgba(255,255,255,0.6);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Certificate Code</p>
          <div style="display:inline-block;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 20px;">
            <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:2px;">${code}</span>
          </div>
          <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:12px 0 0;">Valid until ${formatExpiryDisplay(expiresAt)}</p>
        </div>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px;">
          Use this certificate when registering for any Western Dental Academy event or workshop. Simply enter your code at checkout. A copy of your gift certificate is also attached to this email.
        </p>
        <div style="text-align:center;margin-bottom:20px;">
          <a href="https://westerndentalacademy.com/register"
             style="background-color:#E67E22;color:#ffffff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
            Register for an Event →
          </a>
        </div>
      </div>
      <div style="padding:14px 32px;background:#F4F7F9;text-align:center;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
      </div>
    </div>`
}

function senderReceiptHtml(senderName: string, recipientName: string, recipientEmail: string, amount: number, code: string, expiresAt: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background-color:#0D3B6E;padding:28px 32px;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Gift Certificate Sent!</h1>
        <p style="color:rgba(255,255,255,0.55);margin:6px 0 0;font-size:13px;">Western Dental Academy</p>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
        <p style="color:#0D3B6E;font-size:15px;font-weight:600;margin:0 0 16px;">Hi ${senderName},</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px;">
          Your gift certificate has been sent to <strong>${recipientName}</strong> at <strong>${recipientEmail}</strong>. Here is a summary of your purchase.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151;margin-bottom:24px;">
          <tr><td style="padding:8px 0;color:#6b7280;width:140px;">Recipient</td><td style="padding:8px 0;font-weight:600;">${recipientName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Sent to</td><td style="padding:8px 0;">${recipientEmail}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Amount</td><td style="padding:8px 0;font-weight:600;color:#E67E22;">$${amount} CAD</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Code</td><td style="padding:8px 0;font-family:monospace;font-weight:600;">${code}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Valid until</td><td style="padding:8px 0;">${formatExpiryDisplay(expiresAt)}</td></tr>
        </table>
        <p style="color:#374151;font-size:13px;line-height:1.6;margin:0;">
          Questions? <a href="https://westerndentalacademy.com/contact" style="color:#378ADD;">Contact us</a> or email <a href="mailto:info@westerndentalacademy.com" style="color:#378ADD;">info@westerndentalacademy.com</a>.
        </p>
      </div>
      <div style="padding:14px 32px;background:#F4F7F9;text-align:center;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
      </div>
    </div>`
}


export interface GiftCertFulfilment {
  recipientName: string
  recipientEmail: string
  senderName: string
  amount: number
  code: string
  alreadyProcessed: boolean
}

export async function fulfilGiftCertificate(session: CheckoutSession): Promise<GiftCertFulfilment | null> {
  if (!session.paid) return null
  let alreadyProcessed = false
  const meta = session.metadata ?? {}
  const recipientName  = meta.recipientName  ?? ''
  const recipientEmail = meta.recipientEmail ?? ''
  const senderName     = meta.senderName     ?? ''
  const amount         = Number(meta.amount  ?? 0)
  const code           = meta.code           ?? ''
  const message  = meta.message || undefined

  // Check if already processed (idempotency)
  const existing = await sanity.fetch<{ _id: string } | null>(
    `*[_type == "giftCertificate" && !(_id in path("drafts.**")) && stripeSessionId == $sid][0]{ _id }`,
    { sid: session.id }
  )

  if (existing) {
    alreadyProcessed = true
  } else {
    const now = new Date().toISOString()
    const expiresAt = getExpiryDate()

    // Create Sanity doc
    await sanity.create({
      _type: 'giftCertificate',
      code,
      amount,
      remainingBalance: amount,
      recipientName,
      recipientEmail,
      senderName,
      message: message || undefined,
      purchasedAt: now,
      expiresAt,
      stripeSessionId: session.id,
      ...(session.provider === 'clover' ? { paymentProvider: 'clover', cloverPaymentId: session.paymentRef } : {}),
      status: 'active',
      isAdminGenerated: false,
    })

    // Generate PDF
    const logoPath = path.join(process.cwd(), 'public', 'Inverted.png')
    const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    const pdfBuffer = await generateGiftCertPdf({ recipientName, amount, message, code, expiresAt, logoBase64 })

    // Email recipient
    await resend.emails.send({
      from: 'Western Dental Academy <info@westerndentalacademy.com>',
      to: recipientEmail,
      subject: `${senderName} sent you a WDA Gift Certificate!`,
      html: giftEmailHtml(recipientName, senderName, amount, message, code, expiresAt),
      attachments: [{
        filename: `WDA-Gift-Certificate-${code}.pdf`,
        content: pdfBuffer,
      }],
    })

    // Email sender receipt (use customer_email from session if available)
    const senderEmail = session.provider === 'stripe' ? session.customerEmail : undefined
    if (senderEmail) {
      await resend.emails.send({
        from: 'Western Dental Academy <info@westerndentalacademy.com>',
        to: senderEmail,
        subject: `Your WDA Gift Certificate for ${recipientName} — Receipt`,
        html: senderReceiptHtml(senderName, recipientName, recipientEmail, amount, code, expiresAt),
      })
    }

  }

  return { recipientName, recipientEmail, senderName, amount, code, alreadyProcessed }
}
