import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { getOrCreateMoodleUser, enrollUserInCourse } from '@/lib/moodle'
import { stripe } from '@/lib/stripe/client'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function CourseSuccessContent({ sessionId }: { sessionId: string }) {
  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    notFound()
  }

  if (session.payment_status !== 'paid') {
    notFound()
  }

  const m = session.metadata ?? {}
  const enrollmentId       = m.enrollmentId       ?? ''
  const moodleCourseId     = parseInt(m.moodleCourseId ?? '0', 10)
  const accessDurationDays = parseInt(m.accessDurationDays ?? '365', 10)
  const courseName         = m.courseName         ?? 'Online Course'
  const studentEmail       = m.studentEmail       ?? (session.customer_email ?? '')
  const studentFirstName   = m.studentFirstName   ?? ''
  const studentLastName    = m.studentLastName    ?? ''

  if (!enrollmentId) notFound()

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
      status:              'active',
      accessGrantedAt:     now.toISOString(),
      accessExpiresAt:     accessExpiresAt,
      ...(moodleUserId != null ? { moodleUserId } : {}),
    }).commit()

    // Send confirmation email
    const expiryFormatted = new Date(accessExpiresAt).toLocaleDateString('en-CA', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Edmonton',
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

  const expiryDisplay = new Date(accessExpiresAt).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Edmonton',
  })

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16" style={{ backgroundColor: '#F4F7F9' }}>
      <div className="max-w-lg w-full">
        <div className="rounded-2xl bg-white p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(13,59,110,0.08)' }}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'rgba(22,163,74,0.1)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} className="w-8 h-8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}
          >
            Enrolment Confirmed!
          </h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(43,48,58,0.65)' }}>
            Welcome, {studentFirstName}. You&apos;re now enrolled in <strong>{courseName}</strong>.
          </p>

          <div className="rounded-xl p-5 mb-6 text-left" style={{ backgroundColor: '#F4F7F9' }}>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(13,59,110,0.4)', fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Your Access
            </p>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>Course</span>
              <span className="text-sm font-semibold" style={{ color: '#0D3B6E' }}>{courseName}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>Access Until</span>
              <span className="text-sm font-semibold" style={{ color: '#0D3B6E' }}>{expiryDisplay}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>Platform</span>
              <span className="text-sm font-semibold" style={{ color: '#0D3B6E' }}>WDA Moodle</span>
            </div>
          </div>

          <div className="rounded-xl p-5 mb-6 text-left" style={{ backgroundColor: 'rgba(55,138,221,0.06)', border: '1px solid rgba(55,138,221,0.2)' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: '#1E3560' }}>Next Steps</p>
            <ol className="text-sm space-y-1 pl-4 list-decimal" style={{ color: 'rgba(43,48,58,0.7)' }}>
              <li>Check your email for a confirmation from WDA</li>
              <li>Watch for an email from Moodle to set your account password</li>
              <li>Log in at <a href="https://learn.westerndentalacademy.com" className="underline" style={{ color: '#378ADD' }}>learn.westerndentalacademy.com</a> to begin</li>
            </ol>
          </div>

          <a
            href="https://learn.westerndentalacademy.com"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white mb-4"
            style={{ backgroundColor: '#0D3B6E' }}
          >
            Go to Moodle →
          </a>

          <p className="text-xs" style={{ color: 'rgba(43,48,58,0.4)' }}>
            Questions?{' '}
            <a href="mailto:info@westerndentalacademy.com" style={{ color: '#378ADD' }}>
              info@westerndentalacademy.com
            </a>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/professional-development" className="text-sm" style={{ color: '#378ADD' }}>
            ← Back to Professional Development
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function CoursesSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F7F9' }}>
        <p className="text-sm" style={{ color: 'rgba(43,48,58,0.5)' }}>Loading…</p>
      </main>
    }>
      <CourseSuccessInner searchParams={searchParams} />
    </Suspense>
  )
}

async function CourseSuccessInner({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams
  if (!session_id) notFound()
  return <CourseSuccessContent sessionId={session_id} />
}
