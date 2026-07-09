'use client'

import { useState } from 'react'

interface StudentActionsProps {
  studentId: string
  currentStatus: string
}

export default function StudentActions({ studentId, currentStatus }: StudentActionsProps) {
  const [status, setStatus]   = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const update = async (newStatus: string) => {
    setLoading(true)
    setError(null)
    const prev = status
    setStatus(newStatus) // optimistic

    try {
      const res = await fetch('/api/admin/update-student-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, status: newStatus }),
      })
      if (!res.ok) {
        setStatus(prev)
        setError('Failed')
      }
    } catch {
      setStatus(prev)
      setError('Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">

      {status === 'pending' && (
        <>
          <ActionButton
            label="Accept"
            onClick={() => update('accepted')}
            disabled={loading}
            bg="#22c55e"
          />
          <ActionButton
            label="Reject"
            onClick={() => update('rejected')}
            disabled={loading}
            bg="#dc2626"
          />
        </>
      )}

      {(status === 'accepted' || status === 'enrolled') && (
        <ActionButton
          label="Withdraw"
          onClick={() => update('withdrawn')}
          disabled={loading}
          bg="rgba(30,53,96,0.18)"
          color="#1E3560"
        />
      )}

      {(status === 'rejected' || status === 'withdrawn') && (
        <button
          disabled={loading}
          onClick={() => update('pending')}
          className="text-xs font-semibold transition-opacity duration-150"
          style={{
            color: '#378ADD',
            opacity: loading ? 0.4 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            background: 'none',
            padding: '2px 0',
          }}
        >
          Re-open
        </button>
      )}

      {loading && (
        <span className="text-xs" style={{ color: 'rgba(43,48,58,0.35)' }}>…</span>
      )}

      {error && (
        <span className="text-xs font-semibold" style={{ color: '#dc2626' }}>{error}</span>
      )}

    </div>
  )
}

// ── Pill button ───────────────────────────────────────────────────────────────

function ActionButton({
  label,
  onClick,
  disabled,
  bg,
  color = '#ffffff',
}: {
  label: string
  onClick: () => void
  disabled: boolean
  bg: string
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition-opacity duration-150 whitespace-nowrap"
      style={{
        backgroundColor: bg,
        color,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  )
}
