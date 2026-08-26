'use client'

import { useState } from 'react'

interface Balance {
  vacationRemaining: number
  sickRemaining: number
}

interface Request {
  _id: string
  type: string
  startDate: string
  endDate: string
  halfDay: boolean
  status: string
  submittedAt: string
}

interface Props {
  initialBalance: Balance
  initialRequests: Request[]
}

const TYPE_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
  appointment: 'Appointment',
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:  { bg: 'rgba(230,126,34,0.1)',  color: '#c2681f' },
  approved: { bg: 'rgba(34,197,94,0.1)',   color: '#15803d' },
  denied:   { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626' },
  cancelled:{ bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

export default function TimeOffForm({ initialBalance, initialRequests }: Props) {
  const [balance] = useState<Balance>(initialBalance)
  const [requests, setRequests] = useState<Request[]>(initialRequests)
  const [type, setType] = useState('vacation')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [halfDay, setHalfDay] = useState(false)
  const [reason, setReason] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) return
    if (endDate < startDate) {
      setError('End date must be on or after start date')
      return
    }
    if (type === 'appointment' && (!startTime || !endTime)) {
      setError('Please enter appointment start and end times')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/time/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, startDate, endDate, halfDay, reason, ...(type === 'appointment' ? { startTime, endTime } : {}) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit')

      setRequests(prev => [
        {
          _id: data.request._id,
          type,
          startDate,
          endDate,
          halfDay,
          status: 'pending',
          submittedAt: new Date().toISOString(),
        },
        ...prev,
      ])
      setSubmitted(true)
      setStartDate('')
      setEndDate('')
      setHalfDay(false)
      setReason('')
      setStartTime('')
      setEndTime('')
      setType('vacation')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    borderColor: 'rgba(13,59,110,0.2)',
    color: '#2B303A',
    backgroundColor: '#F4F7F9',
  }

  return (
    <div className="space-y-4">
      {/* Time-off form */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(13,59,110,0.1)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(13,59,110,0.08)' }}>
          <h2
            className="font-bold text-base"
            style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}
          >
            Request Time Off
          </h2>
          <div className="flex gap-5 mt-2">
            <span className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>
              Vacation:{' '}
              <strong style={{ color: '#0D3B6E' }}>{balance.vacationRemaining} days left</strong>
            </span>
            <span className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>
              Sick:{' '}
              <strong style={{ color: '#0D3B6E' }}>{balance.sickRemaining} days left</strong>
            </span>
          </div>
        </div>

        <div className="p-5">
          {submitted ? (
            <div className="text-center py-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
              >
                <span className="text-2xl">✓</span>
              </div>
              <p className="font-semibold mb-1" style={{ color: '#15803d' }}>Request submitted</p>
              <p className="text-sm mb-4" style={{ color: 'rgba(43,48,58,0.55)' }}>
                You'll be notified once management reviews it.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm underline"
                style={{ color: '#378ADD' }}
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#0D3B6E' }}>Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300"
                  style={inputStyle}
                >
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick</option>
                  <option value="personal">Personal</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="appointment">Appointment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#0D3B6E' }}>From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => { setStartDate(e.target.value); if (endDate && endDate < e.target.value) setEndDate(e.target.value) }}
                    required
                    className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#0D3B6E' }}>To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                    min={startDate}
                    className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={inputStyle}
                  />
                </div>
              </div>

              {type === 'appointment' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#0D3B6E' }}>Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      required
                      className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#0D3B6E' }}>End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      required
                      className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {type !== 'appointment' && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={halfDay}
                    onChange={e => setHalfDay(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#0D3B6E' }}
                  />
                  <span className="text-sm" style={{ color: '#2B303A' }}>Half day</span>
                </label>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#0D3B6E' }}>
                  Reason{' '}
                  <span className="font-normal" style={{ color: 'rgba(43,48,58,0.4)' }}>(optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  style={inputStyle}
                />
              </div>

              {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{
                  backgroundColor: '#0D3B6E',
                  color: '#fff',
                  opacity: submitting ? 0.7 : 1,
                  fontFamily: 'var(--font-montserrat), sans-serif',
                }}
              >
                {submitting ? 'Submitting…' : 'Request Time Off'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Request history */}
      {requests.length > 0 && (
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(13,59,110,0.1)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(13,59,110,0.08)' }}>
            <h2
              className="font-bold text-base"
              style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Your Requests
            </h2>
          </div>
          <ul className="divide-y" style={{ borderColor: 'rgba(13,59,110,0.06)' }}>
            {requests.map(r => {
              const style = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending
              const dateLabel = r.startDate === r.endDate
                ? formatDate(r.startDate)
                : `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`
              return (
                <li key={r._id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#0D3B6E' }}>
                      {dateLabel}{r.halfDay ? <span className="ml-1 text-xs" style={{ color: 'rgba(43,48,58,0.45)' }}>· half day</span> : null}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.5)' }}>
                      {TYPE_LABELS[r.type] ?? r.type}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: style.bg, color: style.color }}
                  >
                    {r.status}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
