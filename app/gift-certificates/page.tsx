'use client'

import { useState } from 'react'
import Link from 'next/link'

const QUICK_AMOUNTS = [40, 99, 129, 750]

function FieldLabel({ children, htmlFor, optional }: { children: React.ReactNode; htmlFor: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold mb-1.5" style={{ color: '#0D3B6E' }}>
      {children}
      {optional
        ? <span className="ml-1.5 font-normal" style={{ color: 'rgba(43,48,58,0.4)' }}>(optional)</span>
        : <><span className="ml-0.5" style={{ color: '#378ADD' }} aria-hidden>*</span></>
      }
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  borderColor: 'rgba(13,59,110,0.2)',
  color: '#2B303A',
  backgroundColor: '#ffffff',
}

export default function GiftCertificatesPage() {
  const [amount, setAmount] = useState<number>(129)
  const [customAmount, setCustomAmount] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedAmount = useCustom ? Number(customAmount) : amount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!recipientName.trim()) { setError('Recipient name is required.'); return }
    if (!recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) { setError('A valid recipient email is required.'); return }
    if (!senderName.trim()) { setError('Your name is required.'); return }
    if (!resolvedAmount || resolvedAmount < 40 || resolvedAmount > 750) { setError('Amount must be between $40 and $750 CAD.'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/gift-certificates/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: resolvedAmount,
          recipientName: recipientName.trim(),
          recipientEmail: recipientEmail.trim(),
          senderName: senderName.trim(),
          message: message.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Something went wrong.')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden py-20 px-6"
        style={{ backgroundColor: '#0D3B6E' }}
      >
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="text-xs font-bold tracking-[0.22em] uppercase mb-4" style={{ color: '#E67E22' }}>
            Gift Certificates
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: '#ffffff', fontFamily: 'var(--font-montserrat), sans-serif' }}
          >
            Give the Gift of Learning
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Empower a healthcare professional with access to Western Dental Academy professional development. Redeemable for any event or workshop.
          </p>
        </div>
        {/* Decorative blobs */}
        <div aria-hidden className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(230,126,34,0.12) 0%, transparent 70%)' }} />
        <div aria-hidden className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(55,138,221,0.10) 0%, transparent 70%)' }} />
      </section>

      {/* Feature tiles */}
      <section className="py-10 px-6" style={{ backgroundColor: '#F4F7F9' }}>
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
          {[
            { icon: '💵', title: 'Any Amount', body: '$40 – $750 CAD' },
            { icon: '📧', title: 'Instant Delivery', body: 'Emailed directly to recipient' },
            { icon: '📅', title: 'Valid 1 Year', body: 'From date of purchase' },
          ].map(({ icon, title, body }) => (
            <div key={title} className="rounded-xl p-5 text-center bg-white" style={{ border: '1.5px solid rgba(13,59,110,0.09)' }}>
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-sm font-bold mb-1" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>{title}</p>
              <p className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Purchase form */}
      <section className="py-14 px-6" style={{ backgroundColor: '#F4F7F9' }}>
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl bg-white p-7 sm:p-9" style={{ border: '1.5px solid rgba(13,59,110,0.09)', boxShadow: '0 4px 24px rgba(13,59,110,0.06)' }}>
            <h2 className="text-lg font-bold mb-6" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>
              Purchase a Gift Certificate
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount */}
              <div>
                <FieldLabel htmlFor="gc-amount">Amount (CAD)</FieldLabel>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {QUICK_AMOUNTS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => { setAmount(a); setUseCustom(false) }}
                      className="rounded-lg py-2 text-sm font-bold transition-all"
                      style={{
                        backgroundColor: !useCustom && amount === a ? '#0D3B6E' : 'rgba(13,59,110,0.06)',
                        color: !useCustom && amount === a ? '#ffffff' : 'rgba(13,59,110,0.6)',
                        border: `1.5px solid ${!useCustom && amount === a ? '#0D3B6E' : 'rgba(13,59,110,0.12)'}`,
                      }}
                    >
                      ${a}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="gc-amount"
                    type="number"
                    min={40}
                    max={750}
                    value={customAmount}
                    onChange={e => { setCustomAmount(e.target.value); setUseCustom(true) }}
                    onFocus={() => setUseCustom(true)}
                    placeholder="Custom amount"
                    className="flex-1 rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={inputStyle}
                  />
                  <span className="text-sm font-semibold" style={{ color: 'rgba(13,59,110,0.5)' }}>CAD</span>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'rgba(43,48,58,0.45)' }}>Minimum $40 · Maximum $750</p>
              </div>

              {/* Recipient */}
              <div className="grid grid-cols-1 gap-4 pt-1 border-t" style={{ borderColor: 'rgba(13,59,110,0.08)' }}>
                <p className="text-xs font-bold uppercase tracking-widest pt-2" style={{ color: 'rgba(13,59,110,0.4)' }}>Recipient</p>
                <div>
                  <FieldLabel htmlFor="gc-recipient-name">Recipient Name</FieldLabel>
                  <input
                    id="gc-recipient-name" type="text" placeholder="Jane Smith"
                    value={recipientName} onChange={e => setRecipientName(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="gc-recipient-email">Recipient Email</FieldLabel>
                  <input
                    id="gc-recipient-email" type="email" placeholder="jane@example.com"
                    value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={inputStyle}
                  />
                  <p className="mt-1 text-xs" style={{ color: 'rgba(43,48,58,0.45)' }}>The gift certificate PDF will be emailed here.</p>
                </div>
              </div>

              {/* Sender */}
              <div className="grid grid-cols-1 gap-4 pt-1 border-t" style={{ borderColor: 'rgba(13,59,110,0.08)' }}>
                <p className="text-xs font-bold uppercase tracking-widest pt-2" style={{ color: 'rgba(13,59,110,0.4)' }}>From</p>
                <div>
                  <FieldLabel htmlFor="gc-sender-name">Your Name</FieldLabel>
                  <input
                    id="gc-sender-name" type="text" placeholder="Alex Johnson"
                    value={senderName} onChange={e => setSenderName(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="gc-message" optional>Personal Message</FieldLabel>
                  <textarea
                    id="gc-message"
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, 200))}
                    rows={3}
                    placeholder="Wishing you continued growth in your career!"
                    className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                    style={inputStyle}
                  />
                  <p className="mt-1 text-xs text-right" style={{ color: 'rgba(43,48,58,0.45)' }}>{message.length}/200</p>
                </div>
              </div>

              {error && (
                <p className="text-sm rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-70"
                style={{ backgroundColor: '#E67E22', fontFamily: 'var(--font-montserrat), sans-serif' }}
              >
                {submitting
                  ? 'Redirecting to checkout…'
                  : `Purchase $${resolvedAmount || 0} Gift Certificate →`}
              </button>

              <p className="text-center text-xs" style={{ color: 'rgba(43,48,58,0.4)' }}>
                Secure checkout via Stripe. The gift certificate is emailed immediately after payment.
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: 'rgba(43,48,58,0.55)' }}>
            Already have a gift certificate?{' '}
            <Link href="/register" style={{ color: '#378ADD' }} className="font-semibold hover:underline">
              Use it at registration →
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
