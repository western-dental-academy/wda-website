'use client'

import { useState } from 'react'

export interface CourseOfferingEntry {
  _id: string
  title: string
  price?: number
  extensionPrice?: number
  hours?: number
  accessDurationDays?: number
  moodleCourseId?: number
  active?: boolean
}

export interface CourseEnrollmentEntry {
  _id: string
  student: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  courseName: string
  status: 'active' | 'expired' | 'suspended' | 'completed' | 'extended'
  enrolledAt?: string
  accessGrantedAt?: string
  accessExpiresAt?: string
  completedAt?: string
  certificateSent?: boolean
  moodleUserId?: number
  stripePaymentStatus?: string
  midpointReminderSentAt?: string
  feedbackRating?: number
  feedbackEnjoyedMost?: string
  feedbackImprovement?: string
  feedbackWouldRecommend?: boolean
  feedbackShareConsent?: boolean
  feedbackSubmittedAt?: string
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: 'Active',    bg: 'rgba(22,163,74,0.1)',   color: '#16a34a' },
  extended:  { label: 'Extended',  bg: 'rgba(55,138,221,0.1)',  color: '#1d6fba' },
  expired:   { label: 'Expired',   bg: 'rgba(220,38,38,0.09)',  color: '#dc2626' },
  suspended: { label: 'Suspended', bg: 'rgba(234,179,8,0.1)',   color: '#b45309' },
  completed: { label: 'Completed', bg: 'rgba(30,53,96,0.08)',   color: '#1E3560' },
}

function fmt(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function fmtDuration(days?: number): string {
  if (!days) return '—'
  if (days % 7 === 0) return `${days / 7} week${days / 7 !== 1 ? 's' : ''}`
  return `${days} days`
}

function expiryStyle(iso?: string): React.CSSProperties {
  if (!iso) return {}
  const diff = new Date(iso).getTime() - Date.now()
  if (diff < 0) return { color: '#dc2626', fontWeight: 600 }
  if (diff < 3 * 24 * 60 * 60 * 1000) return { color: '#d97706', fontWeight: 600 }
  return {}
}

// ── Course Offerings Panel ─────────────────────────────────────────────────────

function CourseOfferingsPanel({ offerings }: { offerings: CourseOfferingEntry[] }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-2xl bg-white overflow-hidden mb-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-4 flex items-center justify-between border-b text-left"
        style={{ borderColor: 'rgba(30,53,96,0.08)' }}
      >
        <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>
          Course Offerings <span className="ml-2 font-normal text-xs" style={{ color: 'rgba(30,53,96,0.4)' }}>{offerings.length}</span>
        </h2>
        <span className="text-xs" style={{ color: 'rgba(30,53,96,0.4)' }}>{open ? '▲ Collapse' : '▼ Expand'}</span>
      </button>

      {open && (
        offerings.length === 0 ? (
          <p className="px-6 py-10 text-sm text-center" style={{ color: 'rgba(43,48,58,0.4)' }}>
            No course offerings found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'rgba(30,53,96,0.03)', borderBottom: '1px solid rgba(30,53,96,0.08)' }}>
                  {['Course', 'Price', 'Duration', 'Access Period', 'Moodle ID', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'rgba(30,53,96,0.5)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {offerings.map((c, i) => (
                  <tr
                    key={c._id}
                    style={{
                      borderBottom: '1px solid rgba(30,53,96,0.06)',
                      backgroundColor: i % 2 === 0 ? '#ffffff' : 'rgba(30,53,96,0.015)',
                    }}
                  >
                    <td className="px-4 py-3 font-semibold" style={{ color: '#1E3560' }}>{c.title}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#2B303A' }}>
                      {c.price != null ? `$${c.price}` : '—'}
                      {c.extensionPrice != null && (
                        <span style={{ color: 'rgba(43,48,58,0.5)' }}> / ${c.extensionPrice} ext.</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(43,48,58,0.7)' }}>
                      {c.hours != null ? `${c.hours} hr${c.hours !== 1 ? 's' : ''}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(43,48,58,0.7)' }}>
                      {fmtDuration(c.accessDurationDays)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {c.moodleCourseId ? (
                        <a
                          href={`https://learn.westerndentalacademy.com/course/view.php?id=${c.moodleCourseId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                          style={{ color: '#378ADD' }}
                        >
                          #{c.moodleCourseId}
                        </a>
                      ) : (
                        <span style={{ color: 'rgba(43,48,58,0.3)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold"
                        style={
                          c.active !== false
                            ? { backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a' }
                            : { backgroundColor: 'rgba(107,114,128,0.1)', color: '#6b7280' }
                        }
                      >
                        {c.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

// ── Suspend / Reactivate button ────────────────────────────────────────────────

type ActionState = 'idle' | 'loading' | 'done' | 'error'

function EnrollmentActionButton({
  enrollmentId,
  status,
  onDone,
}: {
  enrollmentId: string
  status: string
  onDone: (id: string, newStatus: 'active' | 'suspended') => void
}) {
  const [state, setState] = useState<ActionState>('idle')

  const isSuspendable  = status === 'active' || status === 'extended'
  const isReactivatable = status === 'suspended'

  if (!isSuspendable && !isReactivatable) return null

  async function handleClick() {
    setState('loading')
    const route = isSuspendable ? '/api/admin/courses/suspend' : '/api/admin/courses/reactivate'
    try {
      const res = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId }),
      })
      if (!res.ok) throw new Error(await res.text())
      setState('done')
      onDone(enrollmentId, isSuspendable ? 'suspended' : 'active')
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  if (state === 'done') return null

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className="rounded-md px-2.5 py-1 text-xs font-semibold transition-opacity"
      style={
        isSuspendable
          ? { backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626', opacity: state === 'loading' ? 0.5 : 1 }
          : { backgroundColor: 'rgba(22,163,74,0.1)',   color: '#16a34a', opacity: state === 'loading' ? 0.5 : 1 }
      }
    >
      {state === 'loading' ? '…' : state === 'error' ? 'Error — retry' : isSuspendable ? 'Suspend' : 'Reactivate'}
    </button>
  )
}

// ── Course Feedback Panel ──────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24"
          fill={s <= rating ? '#E67E22' : 'none'}
          stroke={s <= rating ? '#E67E22' : '#d1d5db'}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}

function CourseFeedbackPanel({ entries }: { entries: CourseEnrollmentEntry[] }) {
  const [open, setOpen] = useState(true)

  const withFeedback = [...entries]
    .filter(e => !!e.feedbackSubmittedAt)
    .sort((a, b) => new Date(b.feedbackSubmittedAt!).getTime() - new Date(a.feedbackSubmittedAt!).getTime())

  const avgRating = withFeedback.length > 0
    ? (withFeedback.reduce((sum, e) => sum + (e.feedbackRating ?? 0), 0) / withFeedback.length).toFixed(1)
    : null

  return (
    <div className="rounded-2xl bg-white overflow-hidden mt-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-4 flex items-center justify-between border-b text-left"
        style={{ borderColor: 'rgba(30,53,96,0.08)' }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>
            Course Feedback <span className="ml-2 font-normal text-xs" style={{ color: 'rgba(30,53,96,0.4)' }}>{withFeedback.length} response{withFeedback.length !== 1 ? 's' : ''}</span>
          </h2>
          {avgRating && (
            <span className="text-xs font-semibold" style={{ color: '#E67E22' }}>
              ★ {avgRating} avg
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: 'rgba(30,53,96,0.4)' }}>{open ? '▲ Collapse' : '▼ Expand'}</span>
      </button>

      {open && (
        withFeedback.length === 0 ? (
          <p className="px-6 py-10 text-sm text-center" style={{ color: 'rgba(43,48,58,0.4)' }}>
            No course feedback received yet.
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(30,53,96,0.06)' }}>
            {withFeedback.map(e => (
              <div key={e._id} className="px-6 py-5">
                <div className="flex flex-wrap items-start gap-x-4 gap-y-1 mb-3">
                  <span className="text-sm font-semibold" style={{ color: '#1E3560' }}>
                    {e.student.firstName} {e.student.lastName}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>{e.courseName}</span>
                  <span className="text-xs ml-auto" style={{ color: 'rgba(43,48,58,0.4)' }}>{fmt(e.feedbackSubmittedAt)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {e.feedbackRating != null && <Stars rating={e.feedbackRating} />}
                  {typeof e.feedbackWouldRecommend === 'boolean' && (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={
                        e.feedbackWouldRecommend
                          ? { backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a' }
                          : { backgroundColor: 'rgba(220,38,38,0.09)', color: '#dc2626' }
                      }
                    >
                      {e.feedbackWouldRecommend ? '✓ Would Recommend' : '✗ Would Not Recommend'}
                    </span>
                  )}
                  {e.feedbackShareConsent && (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a' }}
                    >
                      Can Share
                    </span>
                  )}
                </div>

                {e.feedbackEnjoyedMost && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(30,53,96,0.5)' }}>Enjoyed most</p>
                    <p className="text-sm" style={{ color: '#2B303A' }}>{e.feedbackEnjoyedMost}</p>
                  </div>
                )}
                {e.feedbackImprovement && (
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(30,53,96,0.5)' }}>Could improve</p>
                    <p className="text-sm" style={{ color: '#2B303A' }}>{e.feedbackImprovement}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminCourseEnrollments({
  entries,
  offerings,
}: {
  entries: CourseEnrollmentEntry[]
  offerings: CourseOfferingEntry[]
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})

  function handleStatusChange(id: string, newStatus: 'active' | 'suspended') {
    setLocalStatuses(s => ({ ...s, [id]: newStatus }))
  }

  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    const effectiveStatus = localStatuses[e._id] ?? e.status
    const matchesSearch = !q
      || `${e.student.firstName} ${e.student.lastName}`.toLowerCase().includes(q)
      || e.student.email.toLowerCase().includes(q)
      || e.courseName.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const counts = {
    total:     entries.length,
    active:    entries.filter(e => (localStatuses[e._id] ?? e.status) === 'active').length,
    completed: entries.filter(e => e.status === 'completed').length,
    expired:   entries.filter(e => (localStatuses[e._id] ?? e.status) === 'expired').length,
  }

  return (
    <div>
      {/* Course Offerings panel */}
      <CourseOfferingsPanel offerings={offerings} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Enrollments', value: counts.total,     colour: '#1E3560' },
          { label: 'Active',            value: counts.active,    colour: '#16a34a' },
          { label: 'Completed',         value: counts.completed, colour: '#378ADD' },
          { label: 'Expired',           value: counts.expired,   colour: '#dc2626' },
        ].map(({ label, value, colour }) => (
          <div key={label} className="rounded-xl p-5 bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
            <p className="text-3xl font-bold mb-1" style={{ color: colour }}>{value}</p>
            <p className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center gap-3" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <h2 className="text-sm font-bold flex-1" style={{ color: '#1E3560' }}>Course Enrollments</h2>
          <div className="flex gap-2 flex-wrap">
            <input
              type="search"
              placeholder="Search name, email, course…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-xs border"
              style={{ borderColor: 'rgba(30,53,96,0.2)', color: '#2B303A', backgroundColor: '#F4F7F9', minWidth: 200 }}
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-xs border cursor-pointer"
              style={{ borderColor: 'rgba(30,53,96,0.2)', color: '#2B303A', backgroundColor: '#F4F7F9' }}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="extended">Extended</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-sm text-center" style={{ color: 'rgba(43,48,58,0.4)' }}>
            No enrollments found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'rgba(30,53,96,0.03)', borderBottom: '1px solid rgba(30,53,96,0.08)' }}>
                  {['Student', 'Email', 'Course', 'Status', 'Enrolled', 'Expires / Completed', 'Midpoint', 'Moodle', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'rgba(30,53,96,0.5)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => {
                  const effectiveStatus = (localStatuses[e._id] ?? e.status) as CourseEnrollmentEntry['status']
                  const st = STATUS_STYLE[effectiveStatus] ?? STATUS_STYLE.expired
                  const isTerminal = effectiveStatus === 'completed' || effectiveStatus === 'expired'
                  const expiryIso = isTerminal ? undefined : e.accessExpiresAt
                  return (
                    <tr
                      key={e._id}
                      style={{
                        borderBottom: '1px solid rgba(30,53,96,0.06)',
                        backgroundColor: i % 2 === 0 ? '#ffffff' : 'rgba(30,53,96,0.015)',
                      }}
                    >
                      <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: '#1E3560' }}>
                        {e.student.firstName} {e.student.lastName}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'rgba(43,48,58,0.7)' }}>
                        <a href={`mailto:${e.student.email}`} style={{ color: '#378ADD' }}>
                          {e.student.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]" style={{ color: '#2B303A' }}>
                        <span title={e.courseName} className="line-clamp-2">{e.courseName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold"
                          style={{ backgroundColor: st.bg, color: st.color }}
                        >
                          {st.label}
                          {effectiveStatus === 'completed' && e.certificateSent && (
                            <span className="ml-1 text-[9px]">✓ Cert</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'rgba(43,48,58,0.6)' }}>
                        {fmt(e.enrolledAt)}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {effectiveStatus === 'completed' ? (
                          <span style={{ color: '#16a34a' }}>✓ {fmt(e.completedAt)}</span>
                        ) : (
                          <span style={expiryStyle(e.accessExpiresAt)}>
                            {fmt(e.accessExpiresAt)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {e.midpointReminderSentAt ? (
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ backgroundColor: 'rgba(30,53,96,0.07)', color: 'rgba(30,53,96,0.55)' }}
                            title={`Sent ${fmt(e.midpointReminderSentAt)}`}
                          >
                            ✓ Sent
                          </span>
                        ) : (
                          <span style={{ color: 'rgba(43,48,58,0.3)' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {e.moodleUserId ? (
                          <a
                            href={`https://learn.westerndentalacademy.com/user/profile.php?id=${e.moodleUserId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                            style={{ color: '#378ADD' }}
                          >
                            #{e.moodleUserId}
                          </a>
                        ) : (
                          <span style={{ color: 'rgba(43,48,58,0.3)' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <EnrollmentActionButton
                          enrollmentId={e._id}
                          status={effectiveStatus}
                          onDone={handleStatusChange}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Feedback panel */}
      <CourseFeedbackPanel entries={entries} />
    </div>
  )
}
