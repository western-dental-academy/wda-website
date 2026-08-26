'use client'

import PendingApprovals from '@/components/staff/PendingApprovals'

// ── Types ──────────────────────────────────────────────────────────────────────

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

interface Props {
  clockEntries: ClockEntry[]
  pendingTimeOff: PendingTimeOff[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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

function elapsed(clockIn: string): string {
  const ms = Date.now() - new Date(clockIn).getTime()
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return `${h}h ${m}m`
}

function entryHours(e: ClockEntry): number {
  const end = e.clockOut ? new Date(e.clockOut).getTime() : Date.now()
  return Math.max(0, (end - new Date(e.clockIn).getTime()) / 3_600_000)
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminStaffPanel({ clockEntries, pendingTimeOff }: Props) {
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 3_600_000

  const clockedIn = clockEntries.filter(e => !e.clockOut)
  const recentEntries = clockEntries.filter(e => new Date(e.clockIn).getTime() >= sevenDaysAgo)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Currently Clocked In ── */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
        <div className="px-6 py-4 border-b flex items-center gap-2.5" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block shrink-0" />
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>
            Currently Clocked In
          </h2>
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
                  <p className="text-sm font-semibold" style={{ color: '#1E3560' }}>
                    {e.staffMember.fullName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.5)' }}>
                    Since {fmtTime(e.clockIn)}
                  </p>
                </div>
                <span className="text-sm font-bold tabular-nums" style={{ color: '#15803d' }}>
                  {elapsed(e.clockIn)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Pending Time-Off Requests ── */}
      <PendingApprovals initialRequests={pendingTimeOff} />

      {/* ── Recent Time Entries ── */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>
            Recent Time Entries{' '}
            <span className="text-xs font-normal" style={{ color: 'rgba(43,48,58,0.4)' }}>
              past 7 days
            </span>
          </h2>
        </div>

        {recentEntries.length === 0 ? (
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
                      <td className="px-6 py-3 font-medium" style={{ color: '#1E3560' }}>
                        {e.staffMember.fullName}
                      </td>
                      <td className="px-6 py-3" style={{ color: '#2B303A' }}>
                        {fmtDt(e.clockIn)}
                      </td>
                      <td className="px-6 py-3" style={{ color: '#2B303A' }}>
                        {e.clockOut ? (
                          fmtDt(e.clockOut)
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                            <span style={{ color: '#15803d' }}>Active</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 tabular-nums" style={{ color: '#2B303A' }}>
                        {hours !== null ? (
                          fmtH(hours)
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
