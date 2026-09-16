import type { Metadata } from 'next'
import Link from 'next/link'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { getExpiryDate, formatExpiryDisplay } from '@/lib/giftCertificates'
import { generateGiftCertPdf } from '@/lib/giftCertificatePdf'
import fs from 'fs'
import path from 'path'

export const metadata: Metadata = {
  title: 'Gift Certificate Sent',
  description: 'Your WDA gift certificate has been sent.',
}

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

export default async function GiftCertSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams

  let sent = false
  let recipientName = ''
  let recipientEmail = ''
  let senderName = ''
  let amount = 0
  let code = ''
  let alreadyProcessed = false

  if (sessionId) {
    try {
      // Check Stripe payment
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      if (session.payment_status !== 'paid') {
        return (
          <section className="py-24 px-6" style={{ backgroundColor: '#F4F7F9' }}>
            <div className="max-w-md mx-auto text-center">
              <p style={{ color: '#dc2626' }}>Payment not confirmed. Please try again or contact support.</p>
            </div>
          </section>
        )
      }

      const meta = session.metadata ?? {}
      recipientName  = meta.recipientName  ?? ''
      recipientEmail = meta.recipientEmail ?? ''
      senderName     = meta.senderName     ?? ''
      amount         = Number(meta.amount  ?? 0)
      code           = meta.code           ?? ''
      const message  = meta.message || undefined

      // Check if already processed (idempotency)
      const existing = await sanity.fetch<{ _id: string } | null>(
        `*[_type == "giftCertificate" && !(_id in path("drafts.**")) && stripeSessionId == $sid][0]{ _id }`,
        { sid: sessionId }
      )

      if (existing) {
        alreadyProcessed = true
        sent = true
      } else {
        const now = new Date().toISOString()
        const expiresAt = getExpiryDate()

        // Create Sanity doc
        await sanity.create({
          _type: 'giftCertificate',
          code,
          amount,
          recipientName,
          recipientEmail,
          senderName,
          message: message || undefined,
          purchasedAt: now,
          expiresAt,
          stripeSessionId: sessionId,
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
        const senderEmail = session.customer_details?.email
        if (senderEmail) {
          await resend.emails.send({
            from: 'Western Dental Academy <info@westerndentalacademy.com>',
            to: senderEmail,
            subject: `Your WDA Gift Certificate for ${recipientName} — Receipt`,
            html: senderReceiptHtml(senderName, recipientName, recipientEmail, amount, code, expiresAt),
          })
        }

        sent = true
      }
    } catch (err) {
      console.error('Gift cert success page error:', err)
      sent = true // Stripe only redirects here on successful payment
    }
  }

  return (
    <section className="py-24 px-6" style={{ backgroundColor: '#F4F7F9' }}>
      <div className="max-w-md mx-auto">
        <div
          className="rounded-2xl p-10 sm:p-14 bg-white"
          style={{ border: '1.5px solid rgba(13,59,110,0.09)', boxShadow: '0 4px 24px rgba(13,59,110,0.06)' }}
        >
          {/* Check icon */}
          <div className="w-16 h-16 rounded-full mx-auto mb-7 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(230,126,34,0.1)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#E67E22" strokeWidth={2.25} className="w-8 h-8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-center mb-3"
            style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>
            {alreadyProcessed ? 'Already Sent!' : 'Gift Certificate Sent!'}
          </h1>

          {recipientName && (
            <p className="text-center text-sm mb-6" style={{ color: 'rgba(43,48,58,0.65)' }}>
              Your gift certificate has been emailed to{' '}
              <strong style={{ color: '#0D3B6E' }}>{recipientName}</strong>
              {recipientEmail && <> at <strong style={{ color: '#0D3B6E' }}>{recipientEmail}</strong></>}.
            </p>
          )}

          {code && (
            <div className="rounded-xl p-5 mb-7 text-center" style={{ backgroundColor: '#0D3B6E' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Certificate Code</p>
              <p className="text-xl font-bold tracking-wider" style={{ color: '#E67E22' }}>{code}</p>
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                ${amount} CAD · Redeemable at westerndentalacademy.com/register
              </p>
            </div>
          )}

          <div className="mb-6 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(230,126,34,0.06)', border: '1px solid rgba(230,126,34,0.18)' }}>
            <p style={{ color: '#0D3B6E' }}>
              <strong>📬 Check the spam folder</strong> — the gift certificate email sometimes lands in junk. Add <strong>info@westerndentalacademy.com</strong> to contacts.
            </p>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/" className="rounded-lg px-5 py-2.5 text-sm font-semibold border transition-colors hover:border-[#0D3B6E]"
              style={{ borderColor: 'rgba(13,59,110,0.2)', color: 'rgba(13,59,110,0.55)' }}>
              Back to Home
            </Link>
            <Link href="/gift-certificates" className="rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#E67E22' }}>
              Send Another →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
