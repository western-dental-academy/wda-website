import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCheckoutSession, runFulfilmentOnce, type CheckoutSession } from '@/lib/payments/checkout'
import { fulfilCourseExtension } from '@/lib/courses/extendFulfil'
import PaymentPending from '@/components/PaymentPending'

export const dynamic = 'force-dynamic'

async function ExtendSuccessContent({ sessionId }: { sessionId: string }) {
  let session: CheckoutSession | null = null
  try {
    session = await getCheckoutSession(sessionId)
  } catch {
    notFound()
  }
  if (!session) notFound()

  if (!session.paid) {
    if (session.provider === 'clover') return <PaymentPending />
    notFound()
  }

  const s = session
  const result = await runFulfilmentOnce(s, () => fulfilCourseExtension(s))
  if (!result) notFound()
  const { newExpiresAt, courseName } = result

  const expiryDisplay = new Date(newExpiresAt).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Regina',
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
            Access Extended!
          </h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(43,48,58,0.65)' }}>
            Your access to <strong>{courseName}</strong> has been extended.
          </p>

          <div className="rounded-xl p-5 mb-6 text-left" style={{ backgroundColor: '#F4F7F9' }}>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(13,59,110,0.4)', fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Updated Access
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>New Expiry</span>
              <span className="text-sm font-semibold" style={{ color: '#0D3B6E' }}>{expiryDisplay}</span>
            </div>
          </div>

          <a
            href="https://learn.westerndentalacademy.com"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white mb-4"
            style={{ backgroundColor: '#0D3B6E' }}
          >
            Continue on Moodle →
          </a>

          <div className="mt-4">
            <Link href="/staff" className="text-sm" style={{ color: '#378ADD' }}>
              ← Back to Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

async function ExtendSuccessInner({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams
  if (!session_id) notFound()
  return <ExtendSuccessContent sessionId={session_id} />
}

export default function ExtendSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F7F9' }}>
        <p className="text-sm" style={{ color: 'rgba(43,48,58,0.5)' }}>Loading…</p>
      </main>
    }>
      <ExtendSuccessInner searchParams={searchParams} />
    </Suspense>
  )
}
