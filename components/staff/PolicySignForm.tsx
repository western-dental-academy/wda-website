'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PolicyQuestion } from '@/lib/staff/policies'

interface Props {
  policyId: string
  version: string
  fullName: string
  attestation: string
  questions: PolicyQuestion[]
}

const label = 'text-xs font-bold uppercase tracking-widest'

export default function PolicySignForm({ policyId, version, fullName, attestation, questions }: Props) {
  const router = useRouter()
  const sentinel = useRef<HTMLDivElement>(null)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signedName, setSignedName] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // The form unlocks once the bottom of the policy has scrolled into view
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        setReachedEnd(true)
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const missing = questions.filter(q => q.required !== false && !answers[q._key]?.trim())
  const canSubmit = reachedEnd && agreed && signedName.trim().length > 1 && missing.length === 0 && !busy

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/staff/policies/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId, version, signedName, agreed, answers }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setBusy(false)
    }
  }

  return (
    <>
      <div ref={sentinel} aria-hidden="true" />
      <form
        onSubmit={submit}
        className="rounded-2xl px-6 py-6 space-y-5"
        style={{ backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(13,59,110,0.07)', borderTop: '4px solid #378ADD' }}
      >
        <div>
          <p className={label} style={{ color: 'rgba(13,59,110,0.45)', fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Acknowledgement
          </p>
          {!reachedEnd && (
            <p className="text-sm mt-2" style={{ color: '#8a4a0b' }}>
              Please read the whole policy above. This form unlocks when you reach the end.
            </p>
          )}
        </div>

        <fieldset disabled={!reachedEnd || busy} className="space-y-5 disabled:opacity-50">
          {questions.map(q => (
            <div key={q._key}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#0D3B6E' }}>
                {q.question}
                {q.required === false && <span className="font-normal" style={{ color: 'rgba(43,48,58,0.5)' }}> (if applicable)</span>}
              </p>
              {q.kind === 'text' ? (
                <textarea
                  rows={3}
                  value={answers[q._key] ?? ''}
                  onChange={e => setAnswers(a => ({ ...a, [q._key]: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{ backgroundColor: '#F4F7F9', color: '#2B303A' }}
                />
              ) : (
                <div className="space-y-2">
                  {(q.options ?? []).map(opt => (
                    <label key={opt} className="flex items-start gap-3 text-sm cursor-pointer" style={{ color: '#2B303A' }}>
                      <input
                        type="radio"
                        name={q._key}
                        value={opt}
                        checked={answers[q._key] === opt}
                        onChange={() => setAnswers(a => ({ ...a, [q._key]: opt }))}
                        className="mt-1"
                        style={{ accentColor: '#378ADD' }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <label className="flex items-start gap-3 text-sm cursor-pointer" style={{ color: '#2B303A' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0"
              style={{ accentColor: '#378ADD' }}
            />
            <span className="font-semibold">{attestation}</span>
          </label>

          <div>
            <label htmlFor="signedName" className="block text-sm font-semibold mb-1" style={{ color: '#0D3B6E' }}>
              Type your full name to sign
            </label>
            <input
              id="signedName"
              type="text"
              autoComplete="name"
              value={signedName}
              onChange={e => setSignedName(e.target.value)}
              placeholder={fullName}
              className="w-full rounded-lg px-3 py-2.5 text-base outline-none focus:ring-2"
              style={{ backgroundColor: '#F4F7F9', color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}
            />
            <p className="text-xs mt-1" style={{ color: 'rgba(43,48,58,0.5)' }}>
              Your typed name, today’s date and this version of the policy are saved as your signature.
            </p>
          </div>
        </fieldset>

        {error && (
          <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#fdecec', color: '#b42318' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg py-3 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed"
          style={{ backgroundColor: canSubmit ? '#378ADD' : 'rgba(55,138,221,0.4)' }}
        >
          {busy ? 'Signing…' : 'Sign and submit'}
        </button>
      </form>
    </>
  )
}
