import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Wes from '@/components/Wes'
import { getCheckoutSession, runFulfilmentOnce, type CheckoutSession } from '@/lib/payments/checkout'
import { fulfilCourseCheckout } from '@/lib/courses/fulfil'
import PaymentPending from '@/components/PaymentPending'

export const dynamic = 'force-dynamic'

async function CourseSuccessContent({ sessionId }: { sessionId: string }) {
  let session: CheckoutSession | null = null
  try {
    session = await getCheckoutSession(sessionId)
  } catch {
    notFound()
  }
  if (!session) notFound()

  // Clover reports payment by webhook, which can land a few seconds after the redirect
  if (!session.paid) {
    if (session.provider === 'clover') return <PaymentPending />
    notFound()
  }

  const s = session
  const result = await runFulfilmentOnce(s, () => fulfilCourseCheckout(s))
  if (!result) notFound()
  const { accessExpiresAt, studentFirstName, courseName } = result

  const expiryDisplay = new Date(accessExpiresAt).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Regina',
  })

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16" style={{ backgroundColor: '#F4F7F9' }}>
      <div className="max-w-lg w-full">
        <div className="rounded-2xl bg-white p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(13,59,110,0.08)' }}>
          <Wes pose="thumbs-up" size={140} className="mx-auto mb-3 -mt-2" />

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
