import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

type LogEntry = {
  _id: string
  clockIn: string
  clockOut: string | null
  notes: string | null
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-CA', { timeZone: 'America/Edmonton', hour: 'numeric', minute: '2-digit' })
}

function fmtDuration(clockIn: string, clockOut: string): string {
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime()
  const h = Math.floor(ms / 3_600_000)
  const m = Math.round((ms % 3_600_000) / 60_000)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function fmtDateHeading(isoDate: string): string {
  const [y, mo, d] = isoDate.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function StaffLogPage({
  params,
}: {
  params: Promise<{ staffId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=%2Fstaff%2Fowner')

  const viewer = await client.fetch(
    `*[_type == "staffMember" && clerkUserId == $uid && active == true][0]{ role }`,
    { uid: userId }
  )
  if (!viewer || viewer.role !== 'owner') redirect('/staff')

  const { staffId } = await params

  const [member, logs]: [{ fullName: string } | null, LogEntry[]] = await Promise.all([
    client.fetch(
      `*[_type == "staffMember" && _id == $id][0]{ fullName }`,
      { id: staffId }
    ),
    client.fetch(
      `*[_type == "hoursLog" && staffMember._ref == $id] | order(clockIn desc)[0...60]{ _id, clockIn, clockOut, notes }`,
      { id: staffId }
    ),
  ])

  if (!member) redirect('/staff/owner')

  // Group entries by Edmonton calendar date (YYYY-MM-DD)
  const grouped: Record<string, LogEntry[]> = {}
  for (const log of logs) {
    const key = new Date(log.clockIn).toLocaleDateString('en-CA', {
      timeZone: 'America/Edmonton',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(log)
  }

  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#0D3B6E' }} className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/staff/owner"
            className="text-xs font-bold uppercase tracking-widest mb-3 block"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            ← Team View
          </Link>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
          >
            {member.fullName}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Hours log — most recent 60 entries
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-5">
        {sortedDays.length === 0 && (
          <p style={{ color: 'rgba(43,48,58,0.4)' }}>No hours logged yet.</p>
        )}

        {sortedDays.map(day => (
          <div
            key={day}
            className="rounded-2xl bg-white overflow-hidden"
            style={{ border: '1.5px solid rgba(13,59,110,0.09)' }}
          >
            {/* Day header */}
            <div
              className="px-5 py-3 border-b"
              style={{ borderColor: 'rgba(13,59,110,0.08)' }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'rgba(13,59,110,0.4)' }}
              >
                {fmtDateHeading(day)}
              </p>
            </div>

            {/* Entries */}
            <div className="divide-y" style={{ borderColor: 'rgba(13,59,110,0.06)' }}>
              {grouped[day].map(entry => (
                <div key={entry._id} className="px-5 py-4">
                  <p className="text-sm font-medium" style={{ color: '#0D3B6E' }}>
                    {fmtTime(entry.clockIn)}
                    {' → '}
                    {entry.clockOut ? (
                      <>
                        {fmtTime(entry.clockOut)}
                        <span
                          className="ml-2 text-xs font-normal"
                          style={{ color: 'rgba(43,48,58,0.35)' }}
                        >
                          ({fmtDuration(entry.clockIn, entry.clockOut)})
                        </span>
                      </>
                    ) : (
                      <span style={{ color: '#E67E22' }}>In progress</span>
                    )}
                  </p>
                  {entry.notes && (
                    <p className="text-sm mt-1" style={{ color: 'rgba(43,48,58,0.6)' }}>
                      {entry.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
