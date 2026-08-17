import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import { createClient } from '@sanity/client'
import PendingApprovals from '@/components/staff/PendingApprovals'
import TeamCalendar from '@/components/staff/TeamCalendar'

// Rows averaging below this threshold over 4 weeks get a subtle visual flag.
// Adjust freely — no logic depends on this beyond the flag colour.
const EXPECTED_WEEKLY_HOURS = 37.5

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

function getWeekStart(offsetWeeks = 0): number {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff - offsetWeeks * 7)
  monday.setHours(0, 0, 0, 0)
  return monday.getTime()
}

function hoursInRange(
  logs: Array<{ staffId: string; clockIn: string; clockOut: string | null }>,
  staffId: string,
  rangeStart: number,
  rangeEnd: number
): number {
  return logs
    .filter(l => l.staffId === staffId && new Date(l.clockIn).getTime() >= rangeStart && new Date(l.clockIn).getTime() < rangeEnd)
    .reduce((sum, l) => {
      const s = new Date(l.clockIn).getTime()
      const e = l.clockOut ? new Date(l.clockOut).getTime() : Date.now()
      return sum + Math.max(0, e - s) / 3_600_000
    }, 0)
}

function fmtH(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0 && m === 0) return '0h'
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default async function OwnerPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=%2Fstaff%2Fowner')

  const viewer = await client.fetch(
    `*[_type == "staffMember" && clerkUserId == $uid && active == true][0]{ _id, fullName, role }`,
    { uid: userId }
  )
  if (!viewer || viewer.role !== 'owner') redirect('/staff')

  const fiveWeeksAgo = new Date(getWeekStart(5)).toISOString()
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const [allStaff, allLogs, pendingRequests, approvedThisMonth] = await Promise.all([
    client.fetch(
      `*[_type == "staffMember" && active == true] | order(fullName asc){ _id, fullName }`,
      {}
    ),
    client.fetch(
      `*[_type == "hoursLog" && clockIn >= $since]{ clockIn, clockOut, "staffId": staffMember._ref }`,
      { since: fiveWeeksAgo }
    ),
    client.fetch(
      `*[_type == "timeOffRequest" && status == "pending"] | order(submittedAt asc){
        _id, type, startDate, endDate, halfDay, reason, submittedAt,
        staffMember->{ _id, fullName, email }
      }`,
      {}
    ),
    client.fetch(
      `*[_type == "timeOffRequest" && status == "approved" && startDate <= $monthEnd && endDate >= $monthStart]{
        _id, type, startDate, endDate,
        staffMember->{ _id, fullName }
      }`,
      { monthStart, monthEnd }
    ),
  ])

  const w0 = getWeekStart(0)
  const w1 = getWeekStart(1)
  const w2 = getWeekStart(2)
  const w3 = getWeekStart(3)
  const w4 = getWeekStart(4)
  const now_ts = Date.now()

  const summary = allStaff.map((m: any) => {
    const thisWeek     = hoursInRange(allLogs, m._id, w0, now_ts)
    const lastWeek     = hoursInRange(allLogs, m._id, w1, w0)
    const week2        = hoursInRange(allLogs, m._id, w2, w1)
    const week3        = hoursInRange(allLogs, m._id, w3, w2)
    const week4        = hoursInRange(allLogs, m._id, w4, w3)
    const fourWeekAvg  = (lastWeek + week2 + week3 + week4) / 4
    const pending      = pendingRequests.filter((r: any) => r.staffMember._id === m._id).length
    const flagged      = fourWeekAvg > 0 && fourWeekAvg < EXPECTED_WEEKLY_HOURS * 0.9

    return { _id: m._id, fullName: m.fullName, thisWeek, lastWeek, fourWeekAvg, pending, flagged }
  })

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#0D3B6E' }} className="px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Western Dental Academy
            </p>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Staff Hours &amp; Time Off
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/staff"
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}
            >
              My Clock
            </Link>
            <SignOutButton signOutOptions={{ redirectUrl: '/sign-in' }}>
              <button
                className="rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
              >
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Team hours table */}
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(13,59,110,0.09)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(13,59,110,0.08)' }}>
            <h2
              className="font-bold text-base"
              style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Team Hours
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.4)' }}>
              Rows with a 4-week average below {EXPECTED_WEEKLY_HOURS * 0.9}h are flagged amber.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(13,59,110,0.07)' }}>
                  {['Name', 'This Week', 'Last Week', '4-Week Avg', 'Pending'].map(h => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide"
                      style={{ color: 'rgba(13,59,110,0.4)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.map((row: any) => (
                  <tr
                    key={row._id}
                    style={{
                      borderBottom: '1px solid rgba(13,59,110,0.05)',
                      borderLeft: row.flagged ? '3px solid #E67E22' : '3px solid transparent',
                    }}
                  >
                    <td className="px-6 py-4 font-medium" style={{ color: '#0D3B6E' }}>
                      <Link
                        href={`/staff/owner/log/${row._id}`}
                        className="hover:underline underline-offset-2"
                      >
                        {row.fullName}
                      </Link>
                    </td>
                    <td className="px-6 py-4" style={{ color: '#2B303A' }}>{fmtH(row.thisWeek)}</td>
                    <td className="px-6 py-4" style={{ color: '#2B303A' }}>{fmtH(row.lastWeek)}</td>
                    <td
                      className="px-6 py-4 font-semibold"
                      style={{ color: row.flagged ? '#c2681f' : '#2B303A' }}
                    >
                      {fmtH(row.fourWeekAvg)}
                    </td>
                    <td className="px-6 py-4">
                      {row.pending > 0 ? (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(230,126,34,0.12)', color: '#c2681f' }}
                        >
                          {row.pending}
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(43,48,58,0.25)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending approvals */}
        <PendingApprovals initialRequests={pendingRequests} />

        {/* Team calendar */}
        <TeamCalendar
          requests={approvedThisMonth}
          year={now.getFullYear()}
          month={now.getMonth() + 1}
        />

      </div>
    </main>
  )
}
