import type { Metadata } from 'next'
import Link from 'next/link'
import { getCheckoutSession, runFulfilmentOnce } from '@/lib/payments/checkout'
import { fulfilGiftCertificate } from '@/lib/giftCertificateFulfil'
import PaymentPending from '@/components/PaymentPending'

export const metadata: Metadata = {
  title: 'Gift Certificate Sent',
  description: 'Your WDA gift certificate has been sent.',
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
      const session = await getCheckoutSession(sessionId)
      if (!session || !session.paid) {
        // Clover reports payment by webhook, which can land a few seconds after the redirect
        if (session?.provider === 'clover') return <PaymentPending />
        return (
          <section className="py-24 px-6" style={{ backgroundColor: '#F4F7F9' }}>
            <div className="max-w-md mx-auto text-center">
              <p style={{ color: '#dc2626' }}>Payment not confirmed. Please try again or contact support.</p>
            </div>
          </section>
        )
      }

      const result = await runFulfilmentOnce(session, () => fulfilGiftCertificate(session))
      if (result) {
        ;({ recipientName, recipientEmail, senderName, amount, code, alreadyProcessed } = result)
      }
      sent = true
    } catch (err) {
      console.error('Gift cert success page error:', err)
      sent = true // the payment page only sends people here after payment
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
