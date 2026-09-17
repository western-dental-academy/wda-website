import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { createClient } from '@sanity/client'
import ClockWidget from '@/components/staff/ClockWidget'
import TimeOffForm from '@/components/staff/TimeOffForm'
import DownloadIdCardButton from '@/components/staff/DownloadIdCardButton'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}

function computeHours(logs: Array<{ clockIn: string; clockOut: string | null }>): number {
  const now = Date.now()
  return logs.reduce((sum, log) => {
    const start = new Date(log.clockIn).getTime()
    const end = log.clockOut ? new Date(log.clockOut).getTime() : now
    return sum + Math.max(0, end - start) / 3_600_000
  }, 0)
}

function countDays(start: string, end: string, halfDay: boolean): number {
  if (halfDay) return 0.5
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1)
}

export default async function StaffPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()
  const userEmail = clerkUser?.emailAddresses[0]?.emailAddress?.toLowerCase() ?? ''

  const staff = await client.fetch(
    `*[_type == "staffMember" && !(_id in path("drafts.**")) && clerkUserId == $uid && active == true][0]{
      _id, fullName, role, vacationDaysPerYear, sickDaysPerYear
    }`,
    { uid: userId }
  )
  if (!staff) redirect('/')

  const yearStart = `${new Date().getFullYear()}-01-01`
  const weekStart = getWeekStart()

  const [active, weekLogs, approvedThisYear, requests, myCourses] = await Promise.all([
    client.fetch(
      `*[_type == "hoursLog" && !(_id in path("drafts.**")) && staffMember._ref == $id && !defined(clockOut)] | order(clockIn desc)[0]{ _id, clockIn }`,
      { id: staff._id }
    ),
    client.fetch(
      `*[_type == "hoursLog" && !(_id in path("drafts.**")) && staffMember._ref == $id && clockIn >= $start && defined(clockOut)]{ clockIn, clockOut }`,
      { id: staff._id, start: weekStart }
    ),
    client.fetch(
      `*[_type == "timeOffRequest" && !(_id in path("drafts.**")) && staffMember._ref == $id && status == "approved" && startDate >= $yearStart]{
        type, startDate, endDate, halfDay
      }`,
      { id: staff._id, yearStart }
    ),
    client.fetch(
      `*[_type == "timeOffRequest" && !(_id in path("drafts.**")) && staffMember._ref == $id] | order(submittedAt desc)[0...20]{
        _id, type, startDate, endDate, halfDay, reason, status, submittedAt
      }`,
      { id: staff._id }
    ),
    userEmail
      ? client.fetch(
          `*[_type == "courseEnrollment" && !(_id in path("drafts.**")) && student.email == $email] | order(enrolledAt desc){
            _id, courseName, status, accessExpiresAt, completedAt,
            "moodleCourseId": course->moodleCourseId
          }`,
          { email: userEmail }
        )
      : Promise.resolve([]),
  ])

  const weekHours = computeHours(weekLogs)

  const vacationUsed = approvedThisYear
    .filter((r: any) => r.type === 'vacation')
    .reduce((sum: number, r: any) => sum + countDays(r.startDate, r.endDate, r.halfDay), 0)
  const sickUsed = approvedThisYear
    .filter((r: any) => r.type === 'sick')
    .reduce((sum: number, r: any) => sum + countDays(r.startDate, r.endDate, r.halfDay), 0)

  const balance = {
    vacationRemaining: Math.max(0, (staff.vacationDaysPerYear ?? 10) - vacationUsed),
    sickRemaining: Math.max(0, (staff.sickDaysPerYear ?? 5) - sickUsed),
  }

  const firstName = staff.fullName?.split(' ')[0] ?? 'there'

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#0D3B6E' }} className="px-5 pt-10 pb-8">
        <div className="max-w-lg mx-auto flex items-start justify-between">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Western Dental Academy
            </p>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Hello, {firstName}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2 pt-1">
            {staff.role === 'owner' && (
              <a
                href="/staff/owner"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
              >
                Team View →
              </a>
            )}
            <SignOutButton signOutOptions={{ redirectUrl: '/sign-in' }}>
              <button
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Staff ID Card */}
        <div
          className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
          style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 4px rgba(13,59,110,0.07)' }}
        >
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-0.5"
              style={{ color: 'rgba(13,59,110,0.4)', fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Documents
            </p>
            <p className="text-sm font-semibold" style={{ color: '#0D3B6E' }}>Staff ID Card</p>
          </div>
          <DownloadIdCardButton />
        </div>
        <ClockWidget
          initialActive={active ?? null}
          initialWeekHours={weekHours}
        />
        <TimeOffForm
          initialBalance={balance}
          initialRequests={requests}
        />

        {/* My Courses */}
        {myCourses.length > 0 && (
          <div
            className="rounded-2xl px-5 py-4"
            style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 4px rgba(13,59,110,0.07)' }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(13,59,110,0.4)', fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              My Courses
            </p>
            <div className="flex flex-col gap-3">
              {(myCourses as Array<{
                _id: string
                courseName: string
                status: string
                accessExpiresAt?: string
                completedAt?: string
                moodleCourseId?: number
              }>).map(c => {
                const statusColour =
                  c.status === 'active'    ? '#16a34a' :
                  c.status === 'completed' ? '#378ADD' :
                  c.status === 'expired'   ? '#dc2626' : '#b45309'

                const statusLabel =
                  c.status === 'active'    ? 'Active' :
                  c.status === 'completed' ? 'Completed' :
                  c.status === 'expired'   ? 'Expired' : 'Suspended'

                const dateLabel = c.status === 'completed' && c.completedAt
                  ? `Completed ${new Date(c.completedAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Edmonton' })}`
                  : c.accessExpiresAt
                  ? `Access until ${new Date(c.accessExpiresAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Edmonton' })}`
                  : null

                return (
                  <div
                    key={c._id}
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                    style={{ backgroundColor: '#F4F7F9' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#0D3B6E' }}>
                        {c.courseName}
                      </p>
                      {dateLabel && (
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.55)' }}>{dateLabel}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${statusColour}1a`, color: statusColour }}
                      >
                        {statusLabel}
                      </span>
                      {(c.status === 'active' || c.status === 'completed') && (
                        <a
                          href="https://learn.westerndentalacademy.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                          style={{ backgroundColor: '#0D3B6E' }}
                        >
                          Open →
                        </a>
                      )}
                      {c.status === 'expired' && (
                        <a
                          href={`/api/courses/extend-redirect?enrollmentId=${c._id}`}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                          style={{ backgroundColor: '#E67E22' }}
                        >
                          Extend →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* TODO: Add a late-day reminder cron job that emails anyone still clocked in after 6 PM with a one-click clock-out link */}
    </main>
  )
}
