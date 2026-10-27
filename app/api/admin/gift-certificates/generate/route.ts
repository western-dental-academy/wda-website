import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { generateGiftCode, getExpiryDate, REFERRAL_PERCENT_OFF, REFERRAL_EXPIRY_MONTHS, formatExpiryDisplay } from '@/lib/giftCertificates'
import { Resend } from 'resend'
import { generateGiftCertPdf } from '@/lib/giftCertificatePdf'
import fs from 'fs'
import path from 'path'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'lance@westerndentalacademy.com',
  'ryan@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'amber@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

const resend = new Resend(process.env.RESEND_API_KEY)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  const generatorName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { amount, recipientName, referral, recipientEmail, referredName } = body as {
    amount?: number; recipientName?: string; referral?: boolean; recipientEmail?: string; referredName?: string
  }

  // Refer-a-friend code: 25% off, single use, returned as JSON (and emailed when an address is given)
  if (referral) {
    if (!recipientName?.trim()) return Response.json({ error: 'Referrer name is required' }, { status: 400 })
    const toEmail = recipientEmail?.trim().toLowerCase() || undefined
    if (toEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(toEmail)) {
      return Response.json({ error: 'Enter a valid email address' }, { status: 400 })
    }
    const code = generateGiftCode()
    const expiresAt = getExpiryDate(REFERRAL_EXPIRY_MONTHS)
    await client.create({
      _type: 'giftCertificate',
      code,
      amount: 0,
      remainingBalance: 0,
      percentOff: REFERRAL_PERCENT_OFF,
      recipientName: recipientName.trim(),
      recipientEmail: toEmail,
      referredName: referredName?.trim() || undefined,
      purchasedAt: new Date().toISOString(),
      expiresAt,
      status: 'active',
      isAdminGenerated: false,
      generatedBy: email,
      generatedByName: generatorName || email,
    })

    let emailed = false
    if (toEmail) {
      const firstName = recipientName.trim().split(/\s+/)[0]
      try {
        await resend.emails.send({
          from: 'Western Dental Academy <info@westerndentalacademy.com>',
          to: toEmail,
          subject: `Thanks for the referral! Here's ${REFERRAL_PERCENT_OFF}% off`,
          html: referralEmailHtml(firstName, code, formatExpiryDisplay(expiresAt), referredName?.trim()),
        })
        emailed = true
      } catch (err) {
        console.error('Referral code email error:', err)
      }
    }

    return Response.json({ code, expiresAt, emailed })
  }

  if (!amount || amount < 1) {
    return Response.json({ error: 'Amount is required' }, { status: 400 })
  }

  const code = generateGiftCode()
  const now = new Date().toISOString()
  const expiresAt = getExpiryDate()

  await client.create({
    _type: 'giftCertificate',
    code,
    amount,
    remainingBalance: amount,
    recipientName: recipientName?.trim() || 'Door Prize Winner',
    purchasedAt: now,
    expiresAt,
    status: 'admin',
    isAdminGenerated: true,
    generatedBy: email,
    generatedByName: generatorName || email,
  })

  const logoPath = path.join(process.cwd(), 'public', 'Inverted.png')
  const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`

  const pdfBuffer = await generateGiftCertPdf({
    recipientName: recipientName?.trim() || 'Door Prize Winner',
    amount,
    code,
    expiresAt,
    logoBase64,
  })

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="WDA-Gift-Certificate-${code}.pdf"`,
    },
  })
}

function referralEmailHtml(firstName: string, code: string, expiry: string, friend?: string) {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background-color:#0D3B6E;padding:28px 32px;">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Thanks for the referral!</h1>
    <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
  </div>
  <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
    <p style="color:#0D3B6E;font-size:15px;margin:0 0 16px;">Hi ${firstName},</p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
      ${friend ? `${friend} registered with us and named you as the person who referred them.` : 'Someone you referred just registered with us.'}
      As a thank you, here is ${REFERRAL_PERCENT_OFF}% off your next WDA event, guest speaker or online course.
    </p>
    <div style="background:#F4F7F9;border-radius:8px;padding:20px 24px;margin:0 0 20px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(13,59,110,0.5);">Your code</p>
      <p style="margin:0;font-size:24px;font-weight:700;letter-spacing:0.08em;color:#0D3B6E;font-family:monospace;">${code}</p>
    </div>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Enter it in the <strong>Gift Certificate or Referral Code</strong> box when you register at
      <a href="https://westerndentalacademy.com/register" style="color:#378ADD;">westerndentalacademy.com/register</a>.
      Good for one registration until <strong>${expiry}</strong>. Not valid for the National Board Guided Practice Workshop.
    </p>
    <p style="color:#374151;font-size:13px;line-height:1.6;margin:0;">
      Questions? <a href="mailto:info@westerndentalacademy.com" style="color:#378ADD;">info@westerndentalacademy.com</a>
    </p>
  </div>
  <div style="padding:16px 32px;background:#F4F7F9;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
  </div>
</div>`
}
