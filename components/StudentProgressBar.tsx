'use client'

import { useState, useEffect } from 'react'

interface Props {
  studentId: string
  status: string
}

interface ProgressData {
  provisioned: boolean
  completedCount: number
  totalCount: number
  progressPct: number
}

export default function StudentProgressBar({ studentId, status }: Props) {
  // All hooks declared before any conditional returns (React rules)
  const skip = status === 'pending' || status === 'rejected'

  const [data, setData]       = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(!skip)
  const [failed, setFailed]   = useState(false)

  useEffect(() => {
    if (skip) return
    let cancelled = false

    fetch(`/api/admin/student-progress?studentId=${encodeURIComponent(studentId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          if (json.error) { setFailed(true) } else { setData(json) }
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) { setFailed(true); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [studentId, skip])

  // ── Non-enrolled statuses ──────────────────────────────────────────────────

  if (skip) {
    return <span style={{ color: 'rgba(43,48,58,0.3)' }}>—</span>
  }

  // ── Loading shimmer ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="rounded-full h-1.5 animate-pulse"
          style={{ width: 80, backgroundColor: 'rgba(30,53,96,0.1)' }}
        />
        <div
          className="rounded h-3 animate-pulse"
          style={{ width: 28, backgroundColor: 'rgba(30,53,96,0.1)' }}
        />
      </div>
    )
  }

  // ── Error / Moodle unavailable ─────────────────────────────────────────────

  if (failed) {
    return <span className="text-xs" style={{ color: 'rgba(43,48,58,0.3)' }}>—</span>
  }

  // ── Not yet provisioned in Moodle ──────────────────────────────────────────

  if (!data?.provisioned) {
    return (
      <span className="text-xs" style={{ color: 'rgba(43,48,58,0.35)' }}>
        Not provisioned
      </span>
    )
  }

  // ── Progress bar ───────────────────────────────────────────────────────────

  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full overflow-hidden shrink-0"
        style={{ width: 80, height: 6, backgroundColor: 'rgba(30,53,96,0.08)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${data.progressPct}%`,
            backgroundColor: '#378ADD',
            transition: 'width 400ms ease-out',
          }}
        />
      </div>
      <span
        className="text-xs font-semibold tabular-nums"
        style={{ color: '#1E3560', minWidth: 32 }}
      >
        {data.progressPct}%
      </span>
    </div>
  )
}
