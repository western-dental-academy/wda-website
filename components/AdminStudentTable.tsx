'use client'

import { useState, useMemo, useEffect } from 'react'
import StudentActions from '@/components/StudentActions'
import StudentProgressBar from '@/components/StudentProgressBar'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TranscriptAsset {
  _id: string
  url?: string | null
  originalFilename?: string | null
}

interface Student {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  status: string
  paymentStatus?: string | null
  applicationDate?: string | null
  tuitionAmount?: number | null
  cohort?: string | null
  moodleUserId?: number | null
  notes?: string | null
  program?: { title: string } | null
  transcriptFile?: { asset?: TranscriptAsset | null } | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────


function buildTranscriptUrl(assetId: string): string {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const path = assetId.replace('file-', '').replace(/-([a-z0-9]+)$/, '.$1')
  return `https://cdn.sanity.io/files/${projectId}/production/${path}`
}

function isImageAsset(assetId: string): boolean {
  return /-(?:jpg|jpeg|png)$/i.test(assetId)
}

// ── Brand constants ───────────────────────────────────────────────────────────

const STATUS_COLOUR: Record<string, string> = {
  pending:   '#E67E22',
  accepted:  '#378ADD',
  enrolled:  '#22c55e',
  rejected:  '#dc2626',
  withdrawn: '#888888',
}

const PAYMENT_COLOUR: Record<string, string> = {
  paid:    '#22c55e',
  unpaid:  '#dc2626',
  pending: '#E67E22',
}

const COLS = [
  'Name', 'Student ID', 'Email', 'Programme', 'Cohort',
  'Applied', 'Status', 'Payment', 'Tuition', 'Progress', 'Review', 'Actions',
]

// ── Input style helper ────────────────────────────────────────────────────────

function fieldStyle(active: boolean): React.CSSProperties {
  return {
    backgroundColor: '#F4F7F9',
    border: `1.5px solid ${active ? '#1E3560' : 'rgba(30,53,96,0.12)'}`,
    borderRadius: '8px',
    color: '#1E3560',
    fontSize: '0.875rem',
    padding: '8px 12px',
    outline: 'none',
    transition: 'border-color 150ms',
    width: 'auto',
  }
}

// ── Review Panel sub-components ───────────────────────────────────────────────

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
        style={{ color: '#4A9FD4', fontFamily: 'var(--font-montserrat), sans-serif' }}
      >
        {title}
      </p>
      <dl
        className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 rounded-xl p-4"
        style={{ backgroundColor: '#F4F7F9', border: '1px solid rgba(30,53,96,0.06)' }}
      >
        {children}
      </dl>
    </div>
  )
}

function PanelField({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  const empty = !value || value === '—'
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt
        className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
        style={{ color: 'rgba(30,53,96,0.4)' }}
      >
        {label}
      </dt>
      <dd
        className="text-sm font-medium leading-snug"
        style={{ color: empty ? 'rgba(30,53,96,0.3)' : '#1E3560' }}
      >
        {value || '—'}
      </dd>
    </div>
  )
}

// ── Review Panel ──────────────────────────────────────────────────────────────

function ReviewPanel({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // Reset state when a different student is opened
  useEffect(() => {
    setLoading(false)
    setError(null)
  }, [student?._id])

  const open  = student !== null
  const asset = student?.transcriptFile?.asset

  const notesMap = Object.fromEntries(
    (student?.notes ?? '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.includes(': '))
      .map(line => {
        const colonIndex = line.indexOf(': ')
        return [line.slice(0, colonIndex).trim(), line.slice(colonIndex + 2).trim()]
      })
      .filter(([, value]) => value && value !== 'undefined' && value !== 'null')
  )

  async function updateStatus(newStatus: string) {
    if (!student) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/update-student-status', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ studentId: student._id, status: newStatus }),
      })
      if (!res.ok) throw new Error()
      onClose()
    } catch {
      setError('Update failed — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black transition-opacity duration-300"
        style={{ opacity: open ? 0.5 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={open ? `Application review — ${student?.firstName} ${student?.lastName}` : 'Application review'}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[500px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {student && (
          <>
            {/* Panel header */}
            <div
              className="px-6 py-5 flex items-start justify-between shrink-0"
              style={{ backgroundColor: '#1E3560' }}
            >
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  Application Review
                </p>
                <h2
                  className="text-lg font-bold text-white leading-tight"
                  style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
                >
                  {student.firstName} {student.lastName}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close review panel"
                className="mt-1 rounded-lg p-1.5 transition-colors duration-150 hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

              <PanelSection title="Contact Information">
                <PanelField label="Name"  value={`${student.firstName} ${student.lastName}`} />
                <PanelField label="Email" value={student.email} />
                <PanelField label="Phone" value={student.phone ?? '—'} />
              </PanelSection>

              <PanelSection title="Application Details">
                <PanelField label="Programme"       value={student.program?.title ?? notesMap['Program Interest'] ?? '—'} />
                <PanelField label="Preferred Start" value={notesMap['Preferred Start'] ?? '—'} />
                <PanelField label="Referral Source" value={notesMap['Referral'] ?? '—'} />
                <PanelField label="Date of Birth"   value={notesMap['Date of Birth'] ?? '—'} />
                <PanelField label="Education"       value={notesMap['Education'] ?? '—'} />
                {notesMap['Experience'] && (
                  <PanelField label="Experience" value={notesMap['Experience']} wide />
                )}
              </PanelSection>

              <PanelSection title="Documents">
                {asset?._id ? (
                  <div className="sm:col-span-2">
                    {isImageAsset(asset._id) ? (
                      <div className="flex flex-col gap-3">
                        <img
                          src={buildTranscriptUrl(asset._id)}
                          alt="High school transcript"
                          className="w-full rounded-lg object-contain max-h-64"
                          style={{ border: '1px solid rgba(30,53,96,0.1)' }}
                        />
                        <a
                          href={buildTranscriptUrl(asset._id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold"
                          style={{ color: '#378ADD' }}
                        >
                          Open full size ↗
                        </a>
                      </div>
                    ) : (
                      <a
                        href={buildTranscriptUrl(asset._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 hover:border-[#378ADD]"
                        style={{
                          backgroundColor: '#F4F7F9',
                          color: '#1E3560',
                          border: '1.5px solid rgba(30,53,96,0.12)',
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 shrink-0" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        {asset.originalFilename ?? 'Download Transcript (PDF)'}
                      </a>
                    )}
                  </div>
                ) : (
                  <dd className="text-sm sm:col-span-2" style={{ color: 'rgba(43,48,58,0.4)' }}>
                    No transcript uploaded.
                  </dd>
                )}
              </PanelSection>

            </div>

            {/* Accept / Reject footer */}
            <div
              className="px-6 py-5 shrink-0 flex flex-col gap-3"
              style={{ borderTop: '1px solid rgba(30,53,96,0.08)' }}
            >
              {error && (
                <p className="text-xs font-semibold text-center" style={{ color: '#dc2626' }} role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus('rejected')}
                  disabled={loading}
                  className="flex-1 rounded-xl py-3 text-sm font-bold transition-opacity duration-150 disabled:opacity-50"
                  style={{ backgroundColor: '#dc2626', color: '#fff' }}
                >
                  {loading ? '…' : 'Reject'}
                </button>
                <button
                  onClick={() => updateStatus('accepted')}
                  disabled={loading}
                  className="flex-1 rounded-xl py-3 text-sm font-bold transition-opacity duration-150 disabled:opacity-50"
                  style={{ backgroundColor: '#22c55e', color: '#fff' }}
                >
                  {loading ? '…' : 'Accept'}
                </button>
              </div>
              <p className="text-xs text-center" style={{ color: 'rgba(43,48,58,0.38)' }}>
                Accepting will provision Moodle access and send a welcome email.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminStudentTable({ students }: { students: Student[] }) {
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [cohortFilter,  setCohortFilter]  = useState('')
  const [focused,       setFocused]       = useState<string | null>(null)
  const [reviewStudent, setReviewStudent] = useState<Student | null>(null)

  const focus = (id: string) => ({
    onFocus: () => setFocused(id),
    onBlur:  () => setFocused(null),
  })

  const cohorts = useMemo(() => {
    const set = new Set<string>()
    for (const s of students) if (s.cohort) set.add(s.cohort)
    return Array.from(set).sort()
  }, [students])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students.filter((s) => {
      if (q) {
        const name = `${s.firstName} ${s.lastName}`.toLowerCase()
        if (!name.includes(q) && !s.email.toLowerCase().includes(q)) return false
      }
      if (statusFilter  && s.status !== statusFilter) return false
      if (paymentFilter && (s.paymentStatus ?? 'unpaid') !== paymentFilter) return false
      if (cohortFilter  && s.cohort !== cohortFilter) return false
      return true
    })
  }, [students, search, statusFilter, paymentFilter, cohortFilter])

  const hasFilters = !!(search || statusFilter || paymentFilter || cohortFilter)

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setPaymentFilter('')
    setCohortFilter('')
  }

  return (
    <>
      <ReviewPanel student={reviewStudent} onClose={() => setReviewStudent(null)} />

      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>

        {/* Card header */}
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(30,53,96,0.08)' }}>
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>All Students</h2>
        </div>

        {/* Filter bar */}
        <div
          className="px-6 py-4 flex flex-wrap gap-3 items-center"
          style={{ borderBottom: '1px solid rgba(30,53,96,0.07)', backgroundColor: 'rgba(244,247,249,0.65)' }}
        >
          <input
            type="search"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
            style={fieldStyle(focused === 'search')}
            {...focus('search')}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={fieldStyle(focused === 'status')}
            {...focus('status')}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="enrolled">Enrolled</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={fieldStyle(focused === 'payment')}
            {...focus('payment')}
          >
            <option value="">All Payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>

          {cohorts.length > 0 && (
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              style={fieldStyle(focused === 'cohort')}
              {...focus('cohort')}
            >
              <option value="">All Cohorts</option>
              {cohorts.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-semibold px-3 py-2 rounded-lg transition-colors duration-150 hover:bg-[#F4F7F9]"
              style={{ color: '#378ADD', background: 'none' }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="px-6 py-2" style={{ borderBottom: '1px solid rgba(30,53,96,0.05)' }}>
          <p className="text-xs" style={{ color: 'rgba(43,48,58,0.45)' }}>
            Showing {filtered.length} of {students.length} student{students.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F4F7F9' }}>
                {COLS.map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                    style={{ color: 'rgba(30,53,96,0.4)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => (
                <tr
                  key={student._id}
                  style={{ borderTop: i > 0 ? '1px solid rgba(30,53,96,0.06)' : 'none' }}
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold whitespace-nowrap" style={{ color: '#1E3560' }}>
                      {student.firstName} {student.lastName}
                    </p>
                  </td>

                  {/* Student ID */}
                  <td className="px-4 py-3">
                    <p className="text-sm tabular-nums" style={{ color: 'rgba(43,48,58,0.7)' }}>
                      {student.moodleUserId ? student.moodleUserId + 99999 : '—'}
                    </p>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: 'rgba(43,48,58,0.7)' }}>{student.email}</p>
                  </td>

                  {/* Programme */}
                  <td className="px-4 py-3">
                    <p className="text-sm whitespace-nowrap" style={{ color: 'rgba(43,48,58,0.7)' }}>
                      {student.program?.title ?? '—'}
                    </p>
                  </td>

                  {/* Cohort */}
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: 'rgba(43,48,58,0.7)' }}>
                      {student.cohort ?? '—'}
                    </p>
                  </td>

                  {/* Applied */}
                  <td className="px-4 py-3">
                    <p className="text-sm whitespace-nowrap" style={{ color: 'rgba(43,48,58,0.7)' }}>
                      {student.applicationDate
                        ? new Date(student.applicationDate).toLocaleDateString('en-CA')
                        : '—'}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase whitespace-nowrap"
                      style={{
                        backgroundColor: `${STATUS_COLOUR[student.status] ?? '#888888'}20`,
                        color: STATUS_COLOUR[student.status] ?? '#888888',
                      }}
                    >
                      {student.status}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase whitespace-nowrap"
                      style={{
                        backgroundColor: `${PAYMENT_COLOUR[student.paymentStatus ?? 'unpaid'] ?? '#dc2626'}20`,
                        color: PAYMENT_COLOUR[student.paymentStatus ?? 'unpaid'] ?? '#dc2626',
                      }}
                    >
                      {student.paymentStatus ?? 'unpaid'}
                    </span>
                  </td>

                  {/* Tuition */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium" style={{ color: '#1E3560' }}>
                      {student.tuitionAmount ? `$${student.tuitionAmount.toLocaleString()}` : '—'}
                    </p>
                  </td>

                  {/* Progress */}
                  <td className="px-4 py-3">
                    <StudentProgressBar studentId={student._id} status={student.status} />
                  </td>

                  {/* Review */}
                  <td className="px-4 py-3">
                    {student.status === 'pending' && (
                      <button
                        onClick={() => setReviewStudent(student)}
                        className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-colors duration-150 hover:bg-[#1E3560] hover:text-white"
                        style={{
                          border: '1.5px solid #1E3560',
                          color: '#1E3560',
                          backgroundColor: 'transparent',
                        }}
                      >
                        Review
                      </button>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <StudentActions studentId={student._id} currentStatus={student.status} />
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={COLS.length}
                    className="px-4 py-10 text-center text-sm"
                    style={{ color: 'rgba(43,48,58,0.4)' }}
                  >
                    {hasFilters ? 'No students match the current filters.' : 'No students yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  )
}
