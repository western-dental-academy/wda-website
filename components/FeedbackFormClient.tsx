'use client'

import { useState } from 'react'

interface Props {
  token: string
  firstName: string
  workshop: string
}

export default function FeedbackFormClient({ token, firstName, workshop }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [enjoyedMost, setEnjoyedMost] = useState('')
  const [improvement, setImprovement] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a star rating.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, enjoyedMost, improvement, wouldRecommend }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div
          className="inline-flex items-center justify-center rounded-full mb-5"
          style={{ width: 64, height: 64, backgroundColor: 'rgba(230,126,34,0.1)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E67E22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat, sans-serif)' }}>
          Thank you, {firstName}!
        </h2>
        <p className="text-base" style={{ color: 'rgba(43,48,58,0.65)' }}>
          Your feedback means a lot to us.
        </p>
      </div>
    )
  }

  const displayRating = hovered || rating

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: '#0D3B6E' }}>Hi {firstName}!</p>
        <p className="text-sm" style={{ color: 'rgba(43,48,58,0.65)' }}>
          Tell us about your experience with <strong style={{ color: '#0D3B6E' }}>{workshop}</strong>.
        </p>
      </div>

      {/* Star rating */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#0D3B6E' }}>
          Overall Rating <span style={{ color: '#E67E22' }}>*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform duration-100 hover:scale-110 focus:outline-none"
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill={displayRating >= star ? '#E67E22' : 'none'} stroke={displayRating >= star ? '#E67E22' : '#d1d5db'} strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Enjoyed most */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#0D3B6E' }}>
          What did you enjoy most? <span className="font-normal" style={{ color: 'rgba(43,48,58,0.4)' }}>(Optional)</span>
        </label>
        <textarea
          rows={3}
          value={enjoyedMost}
          onChange={(e) => setEnjoyedMost(e.target.value)}
          placeholder="Share what stood out to you…"
          className="w-full rounded-lg px-4 py-3 text-sm resize-none focus:outline-none"
          style={{
            border: '1.5px solid rgba(30,53,96,0.15)',
            color: '#2B303A',
            backgroundColor: '#F4F7F9',
          }}
        />
      </div>

      {/* Improvement */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#0D3B6E' }}>
          What could we improve? <span className="font-normal" style={{ color: 'rgba(43,48,58,0.4)' }}>(Optional)</span>
        </label>
        <textarea
          rows={3}
          value={improvement}
          onChange={(e) => setImprovement(e.target.value)}
          placeholder="Your honest input helps us improve…"
          className="w-full rounded-lg px-4 py-3 text-sm resize-none focus:outline-none"
          style={{
            border: '1.5px solid rgba(30,53,96,0.15)',
            color: '#2B303A',
            backgroundColor: '#F4F7F9',
          }}
        />
      </div>

      {/* Would recommend */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#0D3B6E' }}>
          Would you recommend WDA to a colleague?
        </label>
        <div className="flex gap-3">
          {([true, false] as const).map((val) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => setWouldRecommend(val)}
              className="flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-150"
              style={{
                border: wouldRecommend === val
                  ? `2px solid ${val ? '#0D3B6E' : '#e53e3e'}`
                  : '2px solid rgba(30,53,96,0.12)',
                backgroundColor: wouldRecommend === val
                  ? val ? 'rgba(13,59,110,0.08)' : 'rgba(229,62,62,0.06)'
                  : 'transparent',
                color: wouldRecommend === val
                  ? val ? '#0D3B6E' : '#e53e3e'
                  : 'rgba(43,48,58,0.5)',
              }}
            >
              {val ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(229,62,62,0.08)', color: '#c53030' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg py-3 text-sm font-bold text-white transition-opacity duration-150 disabled:opacity-60"
        style={{ backgroundColor: '#0D3B6E' }}
      >
        {submitting ? 'Submitting…' : 'Submit Feedback'}
      </button>
    </form>
  )
}
