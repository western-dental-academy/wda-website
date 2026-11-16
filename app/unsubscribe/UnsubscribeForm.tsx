'use client'

import { useState } from 'react'
import Link from 'next/link'

type State = 'idle' | 'working' | 'unsubscribed' | 'resubscribed' | 'error'

const heading = { color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }
const body = { color: 'rgba(43,48,58,0.65)' }

export default function UnsubscribeForm({ token }: { token: string }) {
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')

  async function submit(resubscribe: boolean) {
    setState('working')
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, resubscribe }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
      setState(resubscribe ? 'resubscribed' : 'unsubscribed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setState('error')
    }
  }

  if (!token) {
    return (
      <>
        <h1 className="text-xl font-bold mb-2" style={heading}>Unsubscribe</h1>
        <p className="text-sm mb-6" style={body}>
          Please use the unsubscribe link at the bottom of one of our emails, or email{' '}
          <a href="mailto:info@westerndentalacademy.com" style={{ color: '#378ADD' }}>info@westerndentalacademy.com</a> and we&apos;ll remove you.
        </p>
        <Link href="/" className="text-sm" style={{ color: '#378ADD' }}>← Back to Home</Link>
      </>
    )
  }

  if (state === 'unsubscribed') {
    return (
      <>
        <h1 className="text-xl font-bold mb-2" style={heading}>You&apos;ve been unsubscribed</h1>
        <p className="text-sm mb-6" style={body}>
          You won&apos;t receive our newsletter anymore. You&apos;ll still get emails about anything you register for, like workshop confirmations.
        </p>
        <button onClick={() => submit(true)} className="text-sm underline" style={{ color: '#378ADD' }}>
          Unsubscribed by mistake? Resubscribe
        </button>
      </>
    )
  }

  if (state === 'resubscribed') {
    return (
      <>
        <h1 className="text-xl font-bold mb-2" style={heading}>Welcome back!</h1>
        <p className="text-sm mb-6" style={body}>You&apos;re subscribed to the WDA newsletter again.</p>
        <Link href="/professional-development" className="text-sm" style={{ color: '#378ADD' }}>View upcoming events →</Link>
      </>
    )
  }

  return (
    <>
      <h1 className="text-xl font-bold mb-2" style={heading}>Unsubscribe from WDA emails?</h1>
      <p className="text-sm mb-6" style={body}>
        You&apos;ll stop receiving our monthly newsletter with upcoming workshops, online courses and tips.
      </p>
      {state === 'error' && <p className="text-sm mb-4" style={{ color: '#dc2626' }}>{error}</p>}
      <button
        onClick={() => submit(false)}
        disabled={state === 'working'}
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        style={{ backgroundColor: '#0D3B6E' }}
      >
        {state === 'working' ? 'Working…' : 'Unsubscribe'}
      </button>
      <div className="mt-6">
        <Link href="/" className="text-sm" style={{ color: '#378ADD' }}>No thanks, take me to the website</Link>
      </div>
    </>
  )
}
