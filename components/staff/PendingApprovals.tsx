'use client'

import { useState } from 'react'

interface StaffRef {
  _id: string
  fullName: string
  email: string
}

interface PendingRequest {
  _id: string
  type: string
  startDate: string
  endDate: string
  halfDay: boolean
  reason: string | null
  submittedAt: string
  staffMember: StaffRef
}

interface Props {
  initialRequests: PendingRequest[]
}

const TYPE_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
  appointment: 'Appointment',
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

export default function PendingApprovals({ initialRequests }: Props) {
  const [requests, setRequests] = useState<PendingRequest[]>(initialRequests)
  const [loading, setLoading] = useState<Record<string, 'approved' | 'denied' | null>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  const decide = async (requestId: string, action: 'approved' | 'denied') => {
    setLoading(prev => ({ ...prev, [requestId]: action }))
    try {
      const res = await fetch('/api/time/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, notes: notes[requestId] ?? '' }),
      })
      if (!res.ok) throw new Error('Failed')
      setRequests(prev => prev.filter(r => r._id !== requestId))
    } catch {
      setLoading(prev => ({ ...prev, [requestId]: null }))
    }
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl bg-white px-6 py-8 text-center" style={{ border: '1.5px solid rgba(13,59,110,0.1)' }}>
        <p className="text-sm" style={{ color: 'rgba(43,48,58,0.4)' }}>No pending requests</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(13,59,110,0.1)' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(13,59,110,0.08)' }}>
        <h2
          className="font-bold text-base"
          style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}
        >
          Pending Requests
          <span
            className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(230,126,34,0.12)', color: '#c2681f' }}
          >
            {requests.length}
          </span>
        </h2>
      </div>

      <ul className="divide-y" style={{ borderColor: 'rgba(13,59,110,0.06)' }}>
        {requests.map(r => {
          const isLoading = loading[r._id]
          const dateRange = r.startDate === r.endDate
            ? formatDate(r.startDate)
            : `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`

          return (
            <li key={r._id} className="px-6 py-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#0D3B6E' }}>
                    {r.staffMember.fullName}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: 'rgba(43,48,58,0.65)' }}>
                    {TYPE_LABELS[r.type] ?? r.type} · {dateRange}
                    {r.halfDay && <span className="ml-1 text-xs" style={{ color: 'rgba(43,48,58,0.4)' }}>· half day</span>}
                  </p>
                  {r.reason && (
                    <p className="text-xs mt-1.5 italic" style={{ color: 'rgba(43,48,58,0.5)' }}>
                      "{r.reason}"
                    </p>
                  )}
                </div>
              </div>

              <input
                type="text"
                placeholder="Optional note to employee…"
                value={notes[r._id] ?? ''}
                onChange={e => setNotes(prev => ({ ...prev, [r._id]: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm border mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                style={{ borderColor: 'rgba(13,59,110,0.15)', backgroundColor: '#F4F7F9', color: '#2B303A' }}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => decide(r._id, 'approved')}
                  disabled={!!isLoading}
                  className="flex-1 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
                  style={{
                    backgroundColor: isLoading === 'approved' ? '#15803d' : 'rgba(34,197,94,0.12)',
                    color: '#15803d',
                    opacity: isLoading && isLoading !== 'approved' ? 0.4 : 1,
                  }}
                >
                  {isLoading === 'approved' ? 'Approving…' : 'Approve'}
                </button>
                <button
                  onClick={() => decide(r._id, 'denied')}
                  disabled={!!isLoading}
                  className="flex-1 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
                  style={{
                    backgroundColor: isLoading === 'denied' ? '#dc2626' : 'rgba(220,38,38,0.08)',
                    color: '#dc2626',
                    opacity: isLoading && isLoading !== 'denied' ? 0.4 : 1,
                  }}
                >
                  {isLoading === 'denied' ? 'Denying…' : 'Deny'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
