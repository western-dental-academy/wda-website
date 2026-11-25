'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CountersignButton({ ackId }: { ackId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!confirm('Record your management countersignature on this signed policy?')) return
          setBusy(true)
          setError(null)
          const res = await fetch('/api/staff/policies/countersign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ackId }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) setError(data.error ?? 'Could not countersign.')
          setBusy(false)
          router.refresh()
        }}
        className="text-xs font-bold px-2.5 py-1 rounded-lg text-white disabled:opacity-50"
        style={{ backgroundColor: '#378ADD' }}
      >
        {busy ? 'Saving…' : 'Countersign'}
      </button>
      {error && <span className="text-xs" style={{ color: '#b42318' }}>{error}</span>}
    </span>
  )
}

export function RemindNowButton({ outstandingPeople }: { outstandingPeople: number }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  return (
    <span className="inline-flex items-center gap-3">
      {msg && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>{msg}</span>}
      <button
        type="button"
        disabled={busy || outstandingPeople === 0}
        onClick={async () => {
          if (!confirm(`Email a reminder now to the ${outstandingPeople} staff member${outstandingPeople === 1 ? '' : 's'} with unsigned policies?`)) return
          setBusy(true)
          setMsg(null)
          const res = await fetch('/api/staff/policies/remind', { method: 'POST' })
          const data = await res.json().catch(() => ({}))
          setMsg(
            res.ok
              ? `Sent ${data.sent} email${data.sent === 1 ? '' : 's'}.${data.errors?.length ? ` ${data.errors.length} failed.` : ''}`
              : (data.error ?? 'Could not send.'),
          )
          setBusy(false)
        }}
        className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40"
        style={{ backgroundColor: '#378ADD', color: '#fff' }}
      >
        {busy ? 'Sending…' : 'Email reminders now'}
      </button>
    </span>
  )
}
