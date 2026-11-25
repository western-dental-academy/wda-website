// Online course purchase fulfilment: Moodle enrolment, enrolment record,
// referral reward and confirmation email. Shared by /courses/success and the
// payment webhooks. Safe to call more than once.
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { getOrCreateMoodleUser, enrollUserInCourse } from '@/lib/moodle'
import { rewardReferrer } from '@/lib/referrals'
import type { CheckoutSession } from '@/lib/payments/checkout'

const resend = new Resend(process.env.RESEND_API_KEY)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export interface CourseFulfilment {
  accessExpiresAt: string
  studentFirstName: string
  courseName: string
}

export async function fulfilCourseCheckout(session: CheckoutSession): Promise<CourseFulfilment | null> {
  if (!session.paid) return null

  const m = session.metadata ?? {}
  const enrollmentId       = m.enrollmentId       ?? ''
  const moodleCourseId     = parseInt(m.moodleCourseId ?? '0', 10)
  const accessDurationDays = parseInt(m.accessDurationDays ?? '365', 10)
  const courseName         = m.courseName         ?? 'Online Course'
  const studentEmail       = m.studentEmail       ?? (session.customerEmail ?? '')
  const studentFirstName   = m.studentFirstName   ?? ''
  const studentLastName    = m.studentLastName    ?? ''

  if (!enrollmentId) return null

  // Check if already processed (idempotent)
  const existing = await client.fetch<{ status?: string; accessExpiresAt?: string } | null>(
    `*[_id == $id][0]{ status, accessExpiresAt }`,
    { id: enrollmentId }
  )

  let accessExpiresAt: string

  if (existing?.status === 'active' && existing.accessExpiresAt) {
    accessExpiresAt = existing.accessExpiresAt
  } else {
    // Grant access
    const now = new Date()
    const expiry = new Date(now.getTime() + accessDurationDays * 24 * 60 * 60 * 1000)
    accessExpiresAt = expiry.toISOString()

    // Moodle enrollment
    let moodleUserId: number | null = null
    try {
      moodleUserId = await getOrCreateMoodleUser(studentEmail, studentFirstName, studentLastName)
      await enrollUserInCourse(moodleUserId, moodleCourseId, expiry)
    } catch (err) {
      console.error('Moodle enrollment error:', err)
    }

    // Update Sanity enrollment
    await client.patch(enrollmentId).set({
      stripeSessionId:     session.id,
      stripePaymentStatus: 'paid',
      ...(session.provider === 'clover' ? { paymentProvider: 'clover', cloverPaymentId: session.paymentRef } : {}),
      status:              'active',
      accessGrantedAt:     now.toISOString(),
      accessExpiresAt:     accessExpiresAt,
      ...(moodleUserId != null ? { moodleUserId } : {}),
    }).commit()

    await rewardReferrer(enrollmentId)

    // Mark a referral code used at checkout as redeemed
    if (m.referralCertId) {
      try {
        await client.patch(m.referralCertId)
          .set({ status: 'redeemed', redeemedAt: now.toISOString(), redeemedBy: studentEmail })
          .setIfMissing({ partialRedemptions: [] })
          .append('partialRedemptions', [{
            _key: `course-${now.getTime()}`,
            redeemedAt: now.toISOString(),
            redeemedBy: studentEmail,
            amountUsed: Number(m.referralDiscountDollars ?? 0),
            remainingAfter: 0,
            workshopName: courseName,
          }])
          .commit()
      } catch (err) {
        console.error('Referral code redemption error:', err)
      }
    }

    // Send confirmation email
    const expiryFormatted = new Date(accessExpiresAt).toLocaleDateString('en-CA', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Regina',
    })

    try {
      await resend.emails.send({
        from: 'Western Dental Academy <info@westerndentalacademy.com>',
        to: studentEmail,
        subject: `You're enrolled — ${courseName}`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background-color:#0D3B6E;padding:28px 32px;">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Course Enrolment Confirmed</h1>
    <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
  </div>
  <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
    <p style="color:#0D3B6E;font-size:15px;margin:0 0 16px;">Hi ${studentFirstName},</p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
      You are now enrolled in <strong>${courseName}</strong>. Your access is valid until <strong>${expiryFormatted}</strong>.
    </p>
    <div style="background:#F4F7F9;border-radius:8px;padding:20px 24px;margin:0 0 20px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(13,59,110,0.5);">Getting Started</p>
      <ol style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.8;">
        <li>Visit <a href="https://learn.westerndentalacademy.com" style="color:#378ADD;">learn.westerndentalacademy.com</a></li>
        <li>You will receive a separate email from Moodle to set your password</li>
        <li>Log in and navigate to <strong>${courseName}</strong> to begin</li>
      </ol>
    </div>
    <p style="color:#374151;font-size:13px;line-height:1.6;margin:0;">
      Questions? <a href="mailto:info@westerndentalacademy.com" style="color:#378ADD;">info@westerndentalacademy.com</a>
    </p>
  </div>
  <div style="padding:16px 32px;background:#F4F7F9;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
  </div>
</div>`,
      })
    } catch (err) {
      console.error('Course confirmation email error:', err)
    }
  }

  return { accessExpiresAt, studentFirstName, courseName }
}
