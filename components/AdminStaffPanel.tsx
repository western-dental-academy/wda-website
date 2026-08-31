'use client'

import { useState, useEffect, useRef } from 'react'
import PendingApprovals from '@/components/staff/PendingApprovals'
import DownloadIdCardButton from '@/components/staff/DownloadIdCardButton'

// ── Constants ──────────────────────────────────────────────────────────────────

const OWNER_EMAILS = [
  'aiden@westerndentalacademy.com',
  'lance@westerndentalacademy.com',
  'ryan@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

// ── Exported types ─────────────────────────────────────────────────────────────

export interface ClockEntry {
  _id: string
  clockIn: string
  clockOut: string | null
  notes: string | null
  staffMember: { _id: string; fullName: string }
}

export interface PendingTimeOff {
  _id: string
  type: string
  startDate: string
  endDate: string
  halfDay: boolean
  reason: string | null
  submittedAt: string
  staffMember: { _id: string; fullName: string; email: string }
}

// ── Internal types ─────────────────────────────────────────────────────────────

interface TimeOffRequest {
  _id: string
  type: string
  startDate: string
  endDate: string
  halfDay: boolean
  status: string
  submittedAt: string
}

interface Props {
  clockEntries: ClockEntry[]
  pendingTimeOff: PendingTimeOff[]
  currentUserEmail: string
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function fmtDt(iso: string): string {
  return new Date(iso).toLocaleString('en-CA', {
    timeZone: 'America/Edmonton',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-CA', {
    timeZone: 'America/Edmonton',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function fmtH(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0 && m === 0) return '0h'
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function elapsedLabel(clockIn: string): string {
  const ms = Date.now() - new Date(clockIn).getTime()
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return `${h}h ${m}m`
}

function entryHours(e: ClockEntry): number {
  const end = e.clockOut ? new Date(e.clockOut).getTime() : Date.now()
  return Math.max(0, (end - new Date(e.clockIn).getTime()) / 3_600_000)
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

const TYPE_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
  appointment: 'Appointment',
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:   { bg: 'rgba(230,126,34,0.1)',  color: '#c2681f' },
  approved:  { bg: 'rgba(34,197,94,0.1)',   color: '#15803d' },
  denied:    { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626' },
  cancelled: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
}

const INPUT_STYLE = {
  backgroundColor: '#F4F7F9',
  borderColor: 'rgba(30,53,96,0.2)',
  color: '#2B303A',
}

// ── MyClock ────────────────────────────────────────────────────────────────────

function MyClock() {
  const [active, setActive] = useState<{ _id: string; clockIn: string } | null>(null)
  const [weekHours, setWeekHours] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    fetch('/api/time/clock')
      .then(r => r.json())
      .then(data => { setActive(data.active ?? null); setWeekHours(data.weekHours ?? 0) })
      .catch(() => setError('Failed to load clock status'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (active) {
      const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - new Date(active.clockIn).getTime()) / 1000)))
      tick()
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      setElapsed(0)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [active])

  useEffect(() => {
    if (showNote && textareaRef.current) textareaRef.current.focus()
  }, [showNote])

  const clockIn = async () => {
    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/time/clock', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setActive({ _id: data.entry._id, clockIn: data.entry.clockIn })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  const clockOut = async (note: string) => {
    setSubmitting(true); setError(null); setShowNote(false)
    try {
      const res = await fetch('/api/time/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      if (active) setWeekHours(prev => prev + (Date.now() - new Date(active.clockIn).getTime()) / 3_600_000)
      setActive(null); setNoteText('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setShowNote(true)
    } finally { setSubmitting(false) }
  }

  const clockInTime = active
    ? new Date(active.clockIn).toLocaleTimeString('en-CA', { timeZone: 'America/Edmonton', hour: 'numeric', minute: '2-digit' })
    : null

  const totalWeekHours = active ? weekHours + elapsed / 3600 : weekHours

  return (
    <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
        <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>My Clock</h2>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-sm text-center py-4" style={{ color: 'rgba(43,48,58,0.4)' }}>Loading…</p>
        ) : active ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              <span className="text-xs font-bold tracking-widest" style={{ color: '#15803d' }}>CLOCKED IN</span>
            </div>
            <p className="text-xs mb-4" style={{ color: 'rgba(43,48,58,0.5)' }}>Since {clockInTime}</p>

            <p className="text-4xl font-bold tabular-nums mb-6" style={{ color: '#1E3560', fontFamily: 'monospace' }}>
              {formatElapsed(elapsed)}
            </p>

            {showNote ? (
              <div className="space-y-3">
                <label className="block text-xs font-semibold" style={{ color: '#1E3560' }}>What did you work on?</label>
                <textarea
                  ref={textareaRef}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Answered inquiries, updated records…"
                  rows={2}
                  className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  style={INPUT_STYLE}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => clockOut(noteText)}
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                    style={{ backgroundColor: '#E67E22', color: '#fff', opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? 'Saving…' : 'Submit & Clock Out'}
                  </button>
                  <button
                    onClick={() => clockOut('')}
                    disabled={submitting}
                    className="py-2.5 px-4 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: '#F4F7F9', color: 'rgba(43,48,58,0.55)' }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setNoteText(''); setShowNote(true) }}
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ backgroundColor: '#E67E22', color: '#fff', opacity: submitting ? 0.7 : 1 }}
              >
                Clock Out
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm mb-4" style={{ color: 'rgba(43,48,58,0.5)' }}>Ready to start?</p>
            <button
              onClick={clockIn}
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
              style={{ backgroundColor: '#378ADD', color: '#fff', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Loading…' : 'Clock In'}
            </button>
          </>
        )}

        <p className="text-xs mt-4" style={{ color: 'rgba(43,48,58,0.45)' }}>
          This week:{' '}
          <span className="font-semibold" style={{ color: '#1E3560' }}>{fmtH(totalWeekHours)}</span>
        </p>

        {error && <p className="text-xs mt-2" style={{ color: '#dc2626' }}>{error}</p>}
      </div>
    </div>
  )
}

// ── MyTimeOff ──────────────────────────────────────────────────────────────────

function MyTimeOff() {
  const [balance, setBalance] = useState<{ vacationRemaining: number; sickRemaining: number } | null>(null)
  const [requests, setRequests] = useState<TimeOffRequest[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    fetch('/api/time/request')
      .then(r => r.json())
      .then(data => { setBalance(data.balance ?? null); setRequests(data.requests ?? []) })
      .catch(() => setError('Failed to load time-off data'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) return
    if (endDate < startDate) { setError('End date must be on or after start date'); return }
    if (type === 'appointment' && (!startTime || !endTime)) { setError('Please enter appointment start and end times'); return }

    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/time/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, startDate, endDate, halfDay, reason, ...(type === 'appointment' ? { startTime, endTime } : {}) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit')

      setRequests(prev => [
        { _id: data.request._id, type, startDate, endDate, halfDay, status: 'pending', submittedAt: new Date().toISOString() },
        ...prev,
      ])
      setSubmitted(true)
      setStartDate(''); setEndDate(''); setHalfDay(false); setReason(''); setStartTime(''); setEndTime(''); setType('vacation')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit request')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Request Time Off</h2>
          {balance && (
            <div className="flex gap-5 mt-1.5">
              <span className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>
                Vacation: <strong style={{ color: '#1E3560' }}>{balance.vacationRemaining} days left</strong>
              </span>
              <span className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>
                Sick: <strong style={{ color: '#1E3560' }}>{balance.sickRemaining} days left</strong>
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-sm text-center py-4" style={{ color: 'rgba(43,48,58,0.4)' }}>Loading…</p>
          ) : submitted ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                <span className="text-xl">✓</span>
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: '#15803d' }}>Request submitted</p>
              <p className="text-xs mb-4" style={{ color: 'rgba(43,48,58,0.55)' }}>
                You'll be notified once management reviews it.
              </p>
              <button onClick={() => setSubmitted(false)} className="text-xs underline" style={{ color: '#378ADD' }}>
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E3560' }}>Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300" style={INPUT_STYLE}>
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick</option>
                  <option value="personal">Personal</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="appointment">Appointment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E3560' }}>From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => { setStartDate(e.target.value); if (endDate && endDate < e.target.value) setEndDate(e.target.value) }}
                    required
                    className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E3560' }}>To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                    min={startDate}
                    className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={INPUT_STYLE}
                  />
                </div>
              </div>

              {type === 'appointment' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E3560' }}>Start Time</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E3560' }}>End Time</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300" style={INPUT_STYLE} />
                  </div>
                </div>
              )}

              {type !== 'appointment' && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={halfDay} onChange={e => setHalfDay(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#1E3560' }} />
                  <span className="text-sm" style={{ color: '#2B303A' }}>Half day</span>
                </label>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E3560' }}>
                  Reason{' '}
                  <span className="font-normal" style={{ color: 'rgba(43,48,58,0.4)' }}>(optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  style={INPUT_STYLE}
                />
              </div>

              {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ backgroundColor: '#1E3560', color: '#fff', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Submitting…' : 'Request Time Off'}
              </button>
            </form>
          )}
        </div>
      </div>

      {requests.length > 0 && (
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
            <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>My Requests</h2>
          </div>
          <ul className="divide-y" style={{ borderColor: 'rgba(30,53,96,0.06)' }}>
            {requests.map(r => {
              const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending
              const dateLabel = r.startDate === r.endDate
                ? formatDate(r.startDate)
                : `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`
              return (
                <li key={r._id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1E3560' }}>
                      {dateLabel}
                      {r.halfDay ? <span className="ml-1 text-xs" style={{ color: 'rgba(43,48,58,0.45)' }}>· half day</span> : null}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.5)' }}>
                      {TYPE_LABELS[r.type] ?? r.type}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.bg, color: s.color }}
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

// ── AdminStaffPanel ────────────────────────────────────────────────────────────

export default function AdminStaffPanel({ clockEntries, pendingTimeOff, currentUserEmail }: Props) {
  const isOwner = OWNER_EMAILS.includes(currentUserEmail)
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 3_600_000
  const [showRecentEntries, setShowRecentEntries] = useState(false)

  const clockedIn = clockEntries.filter(e => !e.clockOut)
  const recentEntries = clockEntries.filter(e => new Date(e.clockIn).getTime() >= sevenDaysAgo)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Personal sections — visible to everyone ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
        <MyClock />
        <MyTimeOff />
      </div>

      {/* ── My Documents — visible to everyone ── */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>My Documents</h2>
        </div>
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: '#1E3560' }}>Staff ID Card</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.45)' }}>Download your WDA staff ID card as a PDF</p>
          </div>
          <DownloadIdCardButton />
        </div>
      </div>

      {/* ── Owner-only: team overview ── */}
      {isOwner && (
        <>
          {/* Currently Clocked In */}
          <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
            <div className="px-6 py-4 border-b flex items-center gap-2.5" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block shrink-0" />
              <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Currently Clocked In</h2>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#15803d' }}
              >
                {clockedIn.length}
              </span>
            </div>
            {clockedIn.length === 0 ? (
              <p className="px-6 py-6 text-sm text-center" style={{ color: 'rgba(43,48,58,0.4)' }}>
                No one is currently clocked in
              </p>
            ) : (
              <ul className="divide-y" style={{ borderColor: 'rgba(30,53,96,0.06)' }}>
                {clockedIn.map(e => (
                  <li key={e._id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#1E3560' }}>{e.staffMember.fullName}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.5)' }}>Since {fmtTime(e.clockIn)}</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums" style={{ color: '#15803d' }}>
                      {elapsedLabel(e.clockIn)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pending Time-Off Requests */}
          <PendingApprovals initialRequests={pendingTimeOff} />

          {/* Recent Time Entries */}
          <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
            <button
              onClick={() => setShowRecentEntries(v => !v)}
              className="w-full px-6 py-4 flex items-center justify-between gap-2 text-left"
              style={{ borderBottom: showRecentEntries ? '1px solid rgba(30,53,96,0.08)' : 'none' }}
            >
              <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>
                Recent Time Entries{' '}
                <span className="text-xs font-normal" style={{ color: 'rgba(43,48,58,0.4)' }}>past 7 days</span>
              </h2>
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${showRecentEntries ? 'rotate-180' : 'rotate-0'}`}
                style={{ color: 'rgba(30,53,96,0.35)' }}
                aria-hidden
              >
                <path fillRule="evenodd" clipRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </button>
            {showRecentEntries && (
              recentEntries.length === 0 ? (
                <p className="px-6 py-6 text-sm text-center" style={{ color: 'rgba(43,48,58,0.4)' }}>
                  No entries in the past 7 days
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(30,53,96,0.07)' }}>
                        {['Staff', 'Clock In', 'Clock Out', 'Hours'].map(h => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide"
                            style={{ color: 'rgba(30,53,96,0.4)' }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentEntries.map(e => {
                        const hours = e.clockOut ? entryHours(e) : null
                        return (
                          <tr key={e._id} style={{ borderBottom: '1px solid rgba(30,53,96,0.05)' }}>
                            <td className="px-6 py-3 font-medium" style={{ color: '#1E3560' }}>{e.staffMember.fullName}</td>
                            <td className="px-6 py-3" style={{ color: '#2B303A' }}>{fmtDt(e.clockIn)}</td>
                            <td className="px-6 py-3" style={{ color: '#2B303A' }}>
                              {e.clockOut ? fmtDt(e.clockOut) : (
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                                  <span style={{ color: '#15803d' }}>Active</span>
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3 tabular-nums" style={{ color: '#2B303A' }}>
                              {hours !== null ? fmtH(hours) : <span style={{ color: 'rgba(43,48,58,0.3)' }}>—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </>
      )}

    </div>
  )
}
