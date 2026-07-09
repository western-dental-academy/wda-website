'use client'

import { useState, useMemo } from 'react'
import StudentActions from '@/components/StudentActions'
import StudentProgressBar from '@/components/StudentProgressBar'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Student {
  _id: string
  firstName: string
  lastName: string
  email: string
  status: string
  paymentStatus?: string | null
  applicationDate?: string | null
  tuitionAmount?: number | null
  cohort?: string | null
  moodleUserId?: number | null
  program?: { title: string } | null
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

const COLS = ['Name', 'Student ID', 'Email', 'Programme', 'Cohort', 'Applied', 'Status', 'Payment', 'Tuition', 'Progress', 'Actions']

// ── Input style helper — navy border on focus ─────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminStudentTable({ students }: { students: Student[] }) {
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [cohortFilter,  setCohortFilter]  = useState('')
  const [focused,       setFocused]       = useState<string | null>(null)

  const focus = (id: string) => ({
    onFocus: () => setFocused(id),
    onBlur:  () => setFocused(null),
  })

  // Unique cohorts for the dropdown
  const cohorts = useMemo(() => {
    const set = new Set<string>()
    for (const s of students) if (s.cohort) set.add(s.cohort)
    return Array.from(set).sort()
  }, [students])

  // Filtered rows
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

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setPaymentFilter('')
    setCohortFilter('')
  }

  return (
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
        {/* Search */}
        <input
          type="search"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px]"
          style={fieldStyle(focused === 'search')}
          {...focus('search')}
        />

        {/* Status */}
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

        {/* Payment */}
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

        {/* Cohort — only shown when cohort data exists */}
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

        {/* Clear */}
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
                  className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest"
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
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold" style={{ color: '#1E3560' }}>
                    {student.firstName} {student.lastName}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm tabular-nums" style={{ color: 'rgba(43,48,58,0.7)' }}>
                    {student.moodleUserId ? student.moodleUserId + 99999 : '—'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm" style={{ color: 'rgba(43,48,58,0.7)' }}>{student.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm" style={{ color: 'rgba(43,48,58,0.7)' }}>
                    {student.program?.title ?? '—'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm" style={{ color: 'rgba(43,48,58,0.7)' }}>
                    {student.cohort ?? '—'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm" style={{ color: 'rgba(43,48,58,0.7)' }}>
                    {student.applicationDate
                      ? new Date(student.applicationDate).toLocaleDateString('en-CA')
                      : '—'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase"
                    style={{
                      backgroundColor: `${STATUS_COLOUR[student.status] ?? '#888888'}20`,
                      color: STATUS_COLOUR[student.status] ?? '#888888',
                    }}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase"
                    style={{
                      backgroundColor: `${PAYMENT_COLOUR[student.paymentStatus ?? 'unpaid'] ?? '#dc2626'}20`,
                      color: PAYMENT_COLOUR[student.paymentStatus ?? 'unpaid'] ?? '#dc2626',
                    }}
                  >
                    {student.paymentStatus ?? 'unpaid'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium" style={{ color: '#1E3560' }}>
                    {student.tuitionAmount ? `$${student.tuitionAmount.toLocaleString()}` : '—'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <StudentProgressBar studentId={student._id} status={student.status} />
                </td>
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
  )
}
