'use client'

import { useState } from 'react'

export interface StaffNote {
  _key: string
  note: string
  addedBy: string
  addedAt: string
}

interface Props {
  initialNotes: StaffNote[]
  studentId: string
  currentUserEmail: string
}

const STAFF_NAMES: Record<string, string> = {
  'aiden@westerndentalacademy.com':    'Aiden',
  'lance@westerndentalacademy.com':    'Lance',
  'ryan@westerndentalacademy.com':     'Ryan',
  'jolene@westerndentalacademy.com':   'Jolene',
  'alana@westerndentalacademy.com':    'Alana',
  'collette@westerndentalacademy.com': 'Collette',
  'tammy@westerndentalacademy.com':    'Tammy',
}

function fmtNoteDate(iso: string) {
  return new Date(iso).toLocaleString('en-CA', {
    timeZone: 'America/Edmonton',
    month:    'short',
    day:      'numeric',
    year:     'numeric',
    hour:     'numeric',
    minute:   '2-digit',
  })
}

function generateKey() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export default function StudentNotes({ initialNotes, studentId, currentUserEmail }: Props) {
  const [notes,     setNotes]     = useState<StaffNote[]>(initialNotes)
  const [text,      setText]      = useState('')
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState<Set<string>>(new Set())
  const [error,     setError]     = useState('')

  const canDelete = (note: StaffNote) =>
    note.addedBy === currentUserEmail ||
    currentUserEmail === 'aiden@westerndentalacademy.com'

  // Newest first for display
  const displayed = [...notes].reverse()

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setSaving(true)
    setError('')

    const noteKey = generateKey()
    const optimistic: StaffNote = {
      _key:    noteKey,
      note:    trimmed,
      addedBy: currentUserEmail,
      addedAt: new Date().toISOString(),
    }

    // Optimistic add
    setNotes(prev => [...prev, optimistic])
    setText('')

    try {
      const res = await fetch('/api/admin/student-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, note: trimmed, noteKey }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // Roll back optimistic update
      setNotes(prev => prev.filter(n => n._key !== noteKey))
      setText(trimmed)
      setError('Failed to save note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteNote(noteKey: string) {
    if (!confirm('Delete this note?')) return
    setDeleting(prev => new Set(prev).add(noteKey))

    // Optimistic remove
    setNotes(prev => prev.filter(n => n._key !== noteKey))

    try {
      const res = await fetch('/api/admin/student-notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, noteKey }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // Restore note on failure — re-fetch would be ideal, but for now show error
      setError('Failed to delete note. Please refresh the page.')
    } finally {
      setDeleting(prev => { const n = new Set(prev); n.delete(noteKey); return n })
    }
  }

  return (
    <div>
      {/* Note list */}
      {displayed.length > 0 ? (
        <div className="flex flex-col gap-2.5 mb-5">
          {displayed.map(n => (
            <div
              key={n._key}
              className="rounded-lg px-4 py-3 relative"
              style={{
                backgroundColor: '#F4F7F9',
                border: '1px solid rgba(30,53,96,0.07)',
                borderLeft: '3px solid rgba(30,53,96,0.15)',
                opacity: deleting.has(n._key) ? 0.4 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {/* Note text */}
              <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2" style={{ color: '#1E3560' }}>
                {n.note}
              </p>

              {/* Meta + delete */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px]" style={{ color: 'rgba(43,48,58,0.42)' }}>
                  {STAFF_NAMES[n.addedBy] ?? n.addedBy} · {fmtNoteDate(n.addedAt)}
                </p>
                {canDelete(n) && (
                  <button
                    onClick={() => deleteNote(n._key)}
                    disabled={deleting.has(n._key)}
                    title="Delete note"
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors duration-150 hover:bg-[#fee2e2] disabled:opacity-40 shrink-0"
                    style={{ color: 'rgba(220,38,38,0.5)' }}
                    aria-label="Delete note"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm mb-5" style={{ color: 'rgba(43,48,58,0.38)' }}>
          No staff notes yet.
        </p>
      )}

      {/* Add note form */}
      <form onSubmit={addNote} noValidate>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add an internal note…"
          rows={3}
          className="w-full rounded-lg px-3 py-2.5 text-sm border bg-white outline-none focus:ring-2 focus:ring-[#378ADD]/20 resize-none mb-2"
          style={{ borderColor: 'rgba(30,53,96,0.15)', color: '#1E3560' }}
        />
        {error && (
          <p className="text-xs mb-2" style={{ color: '#dc2626' }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-40 transition-colors duration-150 hover:bg-[#15294a]"
          style={{ backgroundColor: '#1E3560' }}
        >
          {saving ? 'Saving…' : 'Save Note'}
        </button>
      </form>
    </div>
  )
}
