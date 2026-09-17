'use client'

import { useState } from 'react'

export interface CourseEnrollmentEntry {
  _id: string
  student: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  courseName: string
  status: 'active' | 'expired' | 'suspended' | 'completed'
  enrolledAt?: string
  accessGrantedAt?: string
  accessExpiresAt?: string
  completedAt?: string
  certificateSent?: boolean
  moodleUserId?: number
  stripePaymentStatus?: string
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: 'Active',    bg: 'rgba(22,163,74,0.1)',  color: '#16a34a' },
  expired:   { label: 'Expired',   bg: 'rgba(220,38,38,0.09)', color: '#dc2626' },
  suspended: { label: 'Suspended', bg: 'rgba(234,179,8,0.1)',  color: '#b45309' },
  completed: { label: 'Completed', bg: 'rgba(55,138,221,0.1)', color: '#1d4ed8' },
}

function fmt(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function AdminCourseEnrollments({
  entries,
}: {
  entries: CourseEnrollmentEntry[]
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    const matchesSearch = !q
      || `${e.student.firstName} ${e.student.lastName}`.toLowerCase().includes(q)
      || e.student.email.toLowerCase().includes(q)
      || e.courseName.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const counts = {
    total:     entries.length,
    active:    entries.filter(e => e.status === 'active').length,
    completed: entries.filter(e => e.status === 'completed').length,
    expired:   entries.filter(e => e.status === 'expired').length,
  }

  return (
    <div>
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
                  {['Student', 'Email', 'Course', 'Status', 'Enrolled', 'Expires / Completed', 'Moodle'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'rgba(30,53,96,0.5)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => {
                  const st = STATUS_STYLE[e.status] ?? STATUS_STYLE.expired
                  const expiryOrCompleted = e.status === 'completed'
                    ? fmt(e.completedAt)
                    : fmt(e.accessExpiresAt)
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
                          {e.status === 'completed' && e.certificateSent && (
                            <span className="ml-1 text-[9px]">✓ Cert</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'rgba(43,48,58,0.6)' }}>
                        {fmt(e.enrolledAt)}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'rgba(43,48,58,0.6)' }}>
                        {e.status === 'completed' ? (
                          <span style={{ color: '#16a34a' }}>✓ {expiryOrCompleted}</span>
                        ) : e.status === 'expired' ? (
                          <span style={{ color: '#dc2626' }}>{expiryOrCompleted}</span>
                        ) : (
                          expiryOrCompleted
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
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
