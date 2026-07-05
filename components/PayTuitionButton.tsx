'use client'

import { useState } from 'react'

export default function PayTuitionButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePayment() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err) {
      setError('Something went wrong. Please try again or contact us.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#E67E22' }}
      >
        {loading ? 'Redirecting to payment...' : 'Pay Tuition Now'}
      </button>
      {error && (
        <p className="mt-3 text-sm" style={{ color: '#dc2626' }}>{error}</p>
      )}
    </div>
  )
}