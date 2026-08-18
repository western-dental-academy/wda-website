'use client'

import { useState, useEffect, useRef } from 'react'

interface ActiveEntry {
  _id: string
  clockIn: string
}

interface Props {
  initialActive: ActiveEntry | null
  initialWeekHours: number
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0 && m === 0) return '0h'
  if (m === 0) return `${h}h`
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export default function ClockWidget({ initialActive, initialWeekHours }: Props) {
  const [active, setActive] = useState<ActiveEntry | null>(initialActive)
  const [completedWeekHours, setCompletedWeekHours] = useState(initialWeekHours)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNotePrompt, setShowNotePrompt] = useState(false)
  const [noteText, setNoteText] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (active) {
      const tick = () => {
        const seconds = Math.floor((Date.now() - new Date(active.clockIn).getTime()) / 1000)
        setElapsed(Math.max(0, seconds))
      }
      tick()
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setElapsed(0)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active])

  // Focus textarea when note prompt appears
  useEffect(() => {
    if (showNotePrompt && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [showNotePrompt])

  const clockIn = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/time/clock', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setActive({ _id: data.entry._id, clockIn: data.entry.clockIn })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const clockOut = async (note: string) => {
    setLoading(true)
    setError(null)
    setShowNotePrompt(false)
    try {
      const res = await fetch('/api/time/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      if (active) {
        const sessionHours = (Date.now() - new Date(active.clockIn).getTime()) / 3_600_000
        setCompletedWeekHours(prev => prev + sessionHours)
      }
      setActive(null)
      setNoteText('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setShowNotePrompt(true)
    } finally {
      setLoading(false)
    }
  }

  const handleClockOutClick = () => {
    setNoteText('')
    setShowNotePrompt(true)
  }

  const clockInTime = active
    ? new Date(active.clockIn).toLocaleTimeString('en-CA', { timeZone: 'America/Edmonton', hour: 'numeric', minute: '2-digit' })
    : null

  const totalWeekHours = active
    ? completedWeekHours + elapsed / 3600
    : completedWeekHours

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: '#0D3B6E' }}>
      {active ? (
        <div className="px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            <span className="text-xs font-bold tracking-widest" style={{ color: '#4ade80' }}>CLOCKED IN</span>
          </div>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Since {clockInTime}</p>

          <p
            className="text-6xl font-bold tracking-tight mb-8 tabular-nums"
            style={{ color: '#ffffff', fontFamily: 'monospace' }}
          >
            {formatElapsed(elapsed)}
          </p>

          {showNotePrompt ? (
            <div className="text-left space-y-3">
              <label className="block text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                What did you work on?
              </label>
              <textarea
                ref={textareaRef}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Answered patient inquiries, updated student records…"
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  caretColor: '#fff',
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => clockOut(noteText)}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                  style={{
                    backgroundColor: '#E67E22',
                    color: '#fff',
                    opacity: loading ? 0.7 : 1,
                    fontFamily: 'var(--font-montserrat), sans-serif',
                  }}
                >
                  {loading ? 'Saving…' : 'Submit & Clock Out'}
                </button>
                <button
                  onClick={() => clockOut('')}
                  disabled={loading}
                  className="py-3 px-4 rounded-xl text-sm font-medium transition-all active:scale-95"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.55)',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClockOutClick}
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-95"
              style={{
                backgroundColor: '#E67E22',
                color: '#fff',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'var(--font-montserrat), sans-serif',
              }}
            >
              Clock Out
            </button>
          )}

          <p className="text-sm mt-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            This week: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{formatHours(totalWeekHours)}</span>
          </p>
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Ready to start?</p>

          <button
            onClick={clockIn}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-95"
            style={{
              backgroundColor: '#378ADD',
              color: '#fff',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'var(--font-montserrat), sans-serif',
            }}
          >
            {loading ? 'Loading…' : 'Clock In'}
          </button>

          <p className="text-sm mt-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            This week: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{formatHours(completedWeekHours)}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="px-6 pb-4">
          <p className="text-xs text-center" style={{ color: '#fca5a5' }}>{error}</p>
        </div>
      )}
    </div>
  )
}
