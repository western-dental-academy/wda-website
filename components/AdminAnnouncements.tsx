'use client'

import { useState } from 'react'

type Programme = { _id: string; title: string }

type Announcement = {
  _id: string
  title: string
  message: string
  type: string
  publishedAt: string
  expiresAt?: string | null
  program?: { _id: string; title: string } | null
}

interface Props {
  initialAnnouncements: Announcement[]
  programmes: Programme[]
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  info:      { label: 'Info',      bg: 'rgba(55,138,221,0.12)', text: '#1a6cb0' },
  important: { label: 'Important', bg: 'rgba(220,38,38,0.10)',  text: '#b91c1c' },
  reminder:  { label: 'Reminder',  bg: 'rgba(230,126,34,0.12)', text: '#c2681f' },
  success:   { label: 'Good News', bg: 'rgba(34,197,94,0.12)',  text: '#15803d' },
}

const inputStyle: React.CSSProperties = {
  border: '1.5px solid rgba(30,53,96,0.15)',
  color: '#2B303A',
  backgroundColor: '#F4F7F9',
  width: '100%',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '0.875rem',
  outline: 'none',
}

export default function AdminAnnouncements({ initialAnnouncements, programmes }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deactivating, setDeactivating] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')
  const [programId, setProgramId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const resetForm = () => {
    setTitle('')
    setMessage('')
    setType('info')
    setProgramId('')
    setExpiresAt('')
    setFormError(null)
    setShowForm(false)
  }

  const handleCreate = async () => {
    if (!title.trim()) { setFormError('Title is required.'); return }
    if (!message.trim()) { setFormError('Message is required.'); return }

    setSubmitting(true)
    setFormError(null)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          type,
          programId: programId || undefined,
          expiresAt: expiresAt || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create')

      const prog = programmes.find(p => p._id === programId)
      const newAnn: Announcement = {
        ...data.announcement,
        program: prog ? { _id: prog._id, title: prog.title } : null,
      }
      setAnnouncements(prev => [newAnn, ...prev])
      resetForm()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeactivate = async (id: string) => {
    setDeactivating(id)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      setAnnouncements(prev => prev.filter(a => a._id !== id))
    } catch {
      // item stays in list on failure
    } finally {
      setDeactivating(null)
    }
  }

  return (
    <div className="mb-8">
      {/* Section label + action button */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(30,53,96,0.4)' }}>
          Announcements
        </p>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: '#1E3560', color: '#fff' }}
          >
            + New Announcement
          </button>
        )}
      </div>

      {/* Inline create form */}
      {showForm && (
        <div
          className="rounded-2xl bg-white mb-4 p-6"
          style={{ border: '1.5px solid rgba(30,53,96,0.12)' }}
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: '#1E3560' }}>New Announcement</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(30,53,96,0.6)' }}>
                Title <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Clinic day schedule update"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(30,53,96,0.6)' }}>
                Message <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Full announcement text…"
                rows={3}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(30,53,96,0.6)' }}>
                  Type
                </label>
                <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
                  <option value="info">Info</option>
                  <option value="important">Important</option>
                  <option value="reminder">Reminder</option>
                  <option value="success">Good News</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(30,53,96,0.6)' }}>
                  Programme
                </label>
                <select value={programId} onChange={e => setProgramId(e.target.value)} style={inputStyle}>
                  <option value="">All Students</option>
                  {programmes.map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(30,53,96,0.6)' }}>
                Expires At{' '}
                <span style={{ color: 'rgba(30,53,96,0.35)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                style={{ ...inputStyle, color: expiresAt ? '#2B303A' : 'rgba(43,48,58,0.4)' }}
              />
            </div>
          </div>

          {formError && (
            <p className="text-xs mt-3" style={{ color: '#dc2626' }}>{formError}</p>
          )}

          <div className="flex gap-2 mt-5">
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-sm font-bold"
              style={{ backgroundColor: '#1E3560', color: '#fff', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Posting…' : 'Post'}
            </button>
            <button
              onClick={resetForm}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: 'rgba(30,53,96,0.06)', color: 'rgba(30,53,96,0.55)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active announcements list */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
        {announcements.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm" style={{ color: 'rgba(43,48,58,0.4)' }}>No active announcements.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(30,53,96,0.07)' }}>
            {announcements.map(a => {
              const cfg = TYPE_CONFIG[a.type] ?? TYPE_CONFIG.info
              return (
                <div key={a._id} className="px-6 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: cfg.bg, color: cfg.text }}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(43,48,58,0.4)' }}>
                        {new Date(a.publishedAt).toLocaleDateString('en-CA', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                      <span className="text-xs font-medium" style={{ color: 'rgba(30,53,96,0.45)' }}>
                        {a.program?.title ?? 'All Students'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#1E3560' }}>{a.title}</p>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'rgba(43,48,58,0.55)' }}>
                      {a.message}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeactivate(a._id)}
                    disabled={deactivating === a._id}
                    className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(220,38,38,0.08)',
                      color: '#b91c1c',
                      opacity: deactivating === a._id ? 0.5 : 1,
                    }}
                  >
                    {deactivating === a._id ? 'Removing…' : 'Deactivate'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
