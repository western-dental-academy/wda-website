'use client'

import { useState } from 'react'

export default function InlineNewsletterForm({
  successMessage = "You're subscribed! We'll notify you when sessions are announced.",
}: {
  successMessage?: string
}) {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-sm font-semibold" style={{ color: '#4A9FD4' }}>
        {successMessage}
      </p>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-2 max-w-md">
        <label htmlFor="inline-nl-email" className="sr-only">Email address</label>
        <input
          id="inline-nl-email"
          type="email"
          autoComplete="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); if (error) setError('') }}
          disabled={status === 'loading'}
          aria-required="true"
          aria-invalid={!!error || undefined}
          className="flex-1 rounded-lg px-4 py-2.5 text-sm text-white"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: error ? '1.5px solid rgba(255,130,130,0.7)' : '1.5px solid rgba(255,255,255,0.2)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#CF6D17] disabled:opacity-60"
          style={{ backgroundColor: '#E67E22' }}
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-xs" style={{ color: 'rgba(255,160,160,0.9)' }} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
