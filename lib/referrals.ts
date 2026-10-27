import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import {
  generateGiftCode, getExpiryDate, formatExpiryDisplay, isReferralExcluded,
  REFERRAL_PERCENT_OFF, REFERRAL_EXPIRY_MONTHS,
} from '@/lib/giftCertificates'

const resend = new Resend(process.env.RESEND_API_KEY)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

/** Normalise the optional referrer email from the register form; drops anything invalid. */
export function cleanReferrerEmail(email?: string): string | undefined {
  const e = email?.trim().toLowerCase().slice(0, 200)
  return e && isValidEmail(e) ? e : undefined
}

/** Create a single-use 25% referral code; emails it when recipientEmail is given. */
export async function createReferralCode(opts: {
  recipientName: string
  recipientEmail?: string
  referredName?: string
  generatedBy: string
  generatedByName: string
}): Promise<{ code: string; expiresAt: string; emailed: boolean }> {
  const code = generateGiftCode()
  const expiresAt = getExpiryDate(REFERRAL_EXPIRY_MONTHS)
  await client.create({
    _type: 'giftCertificate',
    code,
    amount: 0,
    remainingBalance: 0,
    percentOff: REFERRAL_PERCENT_OFF,
    recipientName: opts.recipientName,
    recipientEmail: opts.recipientEmail,
    referredName: opts.referredName,
    purchasedAt: new Date().toISOString(),
    expiresAt,
    status: 'active',
    isAdminGenerated: false,
    generatedBy: opts.generatedBy,
    generatedByName: opts.generatedByName,
  })

  let emailed = false
  if (opts.recipientEmail) {
    const firstName = opts.recipientName.split(/\s+/)[0]
    try {
      await resend.emails.send({
        from: 'Western Dental Academy <info@westerndentalacademy.com>',
        to: opts.recipientEmail,
        subject: `Thanks for the referral! Here's ${REFERRAL_PERCENT_OFF}% off`,
        html: referralEmailHtml(firstName, code, formatExpiryDisplay(expiresAt), opts.referredName),
      })
      emailed = true
    } catch (err) {
      console.error('Referral code email error:', err)
    }
  }
  return { code, expiresAt, emailed }
}

/**
 * After a paid registration or course enrollment: if the registrant named a referrer with an email,
 * send that referrer a 25% code. Only for a first-time registrant, never to themselves, once per record.
 */
export async function rewardReferrer(docId: string): Promise<void> {
  try {
    const doc = await client.fetch<{
      _id: string; _rev: string; _type: string
      referredByFirstName?: string; referredByLastName?: string; referredByEmail?: string
      referralRewardSent?: boolean; stripePaymentStatus?: string
      email?: string; firstName?: string; lastName?: string; workshop?: string
      student?: { email?: string; firstName?: string; lastName?: string }; courseName?: string
    } | null>(
      `*[_id == $id][0]{ _id, _rev, _type, referredByFirstName, referredByLastName, referredByEmail,
        referralRewardSent, stripePaymentStatus, email, firstName, lastName, workshop, student, courseName }`,
      { id: docId }
    )
    if (!doc?.referredByEmail || doc.referralRewardSent || doc.stripePaymentStatus !== 'paid') return

    const registrantEmail = (doc.email ?? doc.student?.email ?? '').trim().toLowerCase()
    const referrerEmail = doc.referredByEmail.trim().toLowerCase()
    if (!registrantEmail || referrerEmail === registrantEmail) return
    if (doc.workshop && isReferralExcluded(doc.workshop)) return

    // Only new registrants earn a reward: no other paid registration or enrollment under this email
    const earlier = await client.fetch<number>(
      `count(*[!(_id in path("drafts.**")) && _id != $id && (
        (_type == "workshopRegistration" && lower(email) == $email && stripePaymentStatus == "paid") ||
        (_type == "courseEnrollment" && lower(student.email) == $email && stripePaymentStatus == "paid")
      )])`,
      { id: doc._id, email: registrantEmail }
    )
    if (earlier > 0) return

    // Claim the reward first (revision check) so a page refresh can't send it twice
    await client.patch(doc._id).ifRevisionId(doc._rev).set({ referralRewardSent: true }).commit()

    const referrerName = [doc.referredByFirstName, doc.referredByLastName].filter(Boolean).join(' ').trim() || 'Friend'
    const friendName = [doc.firstName ?? doc.student?.firstName, doc.lastName ?? doc.student?.lastName].filter(Boolean).join(' ')
    const { code } = await createReferralCode({
      recipientName: referrerName,
      recipientEmail: referrerEmail,
      referredName: friendName || undefined,
      generatedBy: 'auto-referral',
      generatedByName: 'Automatic (referral)',
    })
    await client.patch(doc._id).set({ referralRewardCode: code }).commit()
  } catch (err) {
    console.error('Referral reward error:', err)
  }
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
