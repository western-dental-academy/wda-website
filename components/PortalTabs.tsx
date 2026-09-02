'use client'

import { useState } from 'react'
import Link from 'next/link'
import PayTuitionButton from '@/components/PayTuitionButton'

// ── Serialisable types passed from server ────────────────────────────────────

interface StudentProgram {
  _id: string
  title: string
  moodleCourseId?: number
}

export interface SerializedStudent {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  status: string
  moodleUserId?: number | null
  applicationDate?: string | null
  acceptedDate?: string | null
  paymentStatus?: string | null
  tuitionAmount?: number | null
  stripeCustomerId?: string | null
  program?: StudentProgram | null
}

export interface SerializedAnnouncement {
  _id: string
  title: string
  message: string
  type: string
  publishedAt: string
}

export interface SerializedCharge {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  description: string | null
  receipt_url: string | null
}

export interface SerializedWorkshopDate {
  _id: string
  workshop: string
  date: string
  capacity: number
  category: string
  registered?: number
}

export interface SerializedWorkshopRegistration {
  workshopDateId: string
}

export interface ProgressStatus {
  cmid: number
  modname: string
  state: number
}

export interface GradeItem {
  id: number
  itemname?: string | null
  gradeformatted?: string | null
}

export interface PortalTabsProps {
  student: SerializedStudent | null
  userEmail: string
  announcements: SerializedAnnouncement[]
  progressStatuses: ProgressStatus[] | null
  gradeItems: GradeItem[] | null
  assignmentCourses: any[] | null
  submissions: any | null
  activityNames: Record<number, string>
  completedCount: number
  totalCount: number
  progressPct: number
  courseComplete: boolean
  isEnrolled: boolean
  moodleCourseUrl: string
  paymentHistory: SerializedCharge[] | null
  workshopDates: SerializedWorkshopDate[]
  myWorkshopRegistrations: SerializedWorkshopRegistration[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_COLOUR: Record<string, string> = {
  pending: '#E67E22',
  accepted: '#378ADD',
  enrolled: '#22c55e',
  rejected: '#dc2626',
  withdrawn: '#888888',
}

const CATEGORY_COLOUR: Record<string, string> = {
  'workshop':      '#16a34a',
  'course':        '#378ADD',
  'guest-speaker': '#8b5cf6',
}

const CATEGORY_LABEL: Record<string, string> = {
  'workshop':      'Workshop',
  'course':        'Course',
  'guest-speaker': 'Guest Speaker',
}

const TABS = [
  { id: 'overview',  label: 'Overview'  },
  { id: 'course',    label: 'Course'    },
  { id: 'calendar',  label: 'Calendar'  },
  { id: 'grades',    label: 'Grades'    },
  { id: 'payments',  label: 'Payments'  },
  { id: 'documents', label: 'Documents' },
  { id: 'profile',   label: 'Profile'   },
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const CARD        = 'rounded-2xl p-8 bg-white'
const CARD_BORDER = '1.5px solid rgba(30,53,96,0.09)'

const WORKSHOP_PRICES: Record<string, number> = {
  'Ergonomics in Dentistry: Hands, Feet and Spine': 40,
  'Ergonomics in Dentistry: Hips and Hamstrings': 40,
  'Ergonomics in Dentistry: Neck and Shoulders': 40,
  'National Board Guided Practice Workshop': 600,
}

function getWorkshopPricing(workshop: string) {
  const base = WORKSHOP_PRICES[workshop]
  if (!base) return null
  const baseInCents = base * 100
  const feeInCents  = Math.round((baseInCents + 30) / (1 - 0.033) - baseInCents)
  return { base, fee: feeInCents / 100, total: (baseInCents + feeInCents) / 100 }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatWorkshopDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PortalTabs({
  student,
  userEmail,
  announcements,
  progressStatuses,
  gradeItems,
  assignmentCourses,
  submissions,
  activityNames,
  completedCount,
  totalCount,
  progressPct,
  courseComplete,
  moodleCourseUrl,
  paymentHistory,
  workshopDates,
  myWorkshopRegistrations,
}: PortalTabsProps) {
  // All hooks at the top — no code between them, no conditional hooks
  const [activeTab,   setActiveTab]   = useState('overview')
  const [viewYear,    setViewYear]    = useState(() => new Date().getFullYear())
  const [viewMonth,   setViewMonth]   = useState(() => new Date().getMonth())
  const [selectedDay,   setSelectedDay]   = useState<string | null>(null)
  const [workshopModal, setWorkshopModal] = useState<SerializedWorkshopDate | null>(null)
  const [modalLoading,  setModalLoading]  = useState(false)
  const [modalError,    setModalError]    = useState('')

  const [waitlistLoadingIds, setWaitlistLoadingIds] = useState<Set<string>>(new Set())
  const [waitlistJoinedIds,  setWaitlistJoinedIds]  = useState<Set<string>>(new Set())
  const [waitlistErrors,     setWaitlistErrors]     = useState<Record<string, string>>({})

  const registeredDateIds = new Set(myWorkshopRegistrations.map(r => r.workshopDateId))

  async function joinWaitlist(w: SerializedWorkshopDate) {
    if (!student) return
    setWaitlistLoadingIds(prev => new Set(prev).add(w._id))
    setWaitlistErrors(prev => ({ ...prev, [w._id]: '' }))
    try {
      const res = await fetch('/api/workshops/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:      student.firstName,
          lastName:       student.lastName,
          email:          userEmail,
          phone:          student.phone ?? '',
          workshop:       w.workshop,
          workshopDateId: w._id,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Failed to join waitlist')
      setWaitlistJoinedIds(prev => new Set(prev).add(w._id))
    } catch (err: unknown) {
      setWaitlistErrors(prev => ({
        ...prev,
        [w._id]: err instanceof Error ? err.message : 'Something went wrong',
      }))
    } finally {
      setWaitlistLoadingIds(prev => { const n = new Set(prev); n.delete(w._id); return n })
    }
  }

  async function proceedToPayment() {
    if (!workshopModal || !student) return
    setModalLoading(true)
    setModalError('')
    try {
      const res = await fetch('/api/workshops/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: student.firstName,
          lastName:  student.lastName,
          email:     userEmail,
          phone:     student.phone ?? '',
          workshop:  workshopModal.workshop,
          workshopDateId: workshopModal._id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Registration failed')
      window.location.href = data.url
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Something went wrong')
      setModalLoading(false)
    }
  }

  // ── Non-enrolled early returns ────────────────────────────────────────────

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className={`${CARD} text-center`} style={{ border: CARD_BORDER }}>
          <h2 className="text-lg font-bold text-[#1E3560] mb-2">No Application Found</h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(43,48,58,0.6)' }}>
            No application was found for {userEmail}.
          </p>
          <Link
            href="/apply"
            className="inline-block rounded-lg px-6 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: '#E67E22' }}
          >
            Apply Now
          </Link>
        </div>
      </div>
    )
  }

  if (student.status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-6">
        {announcements.length > 0 && <AnnouncementList announcements={announcements} />}
        <div className={CARD} style={{ border: CARD_BORDER }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#E67E22' }} />
            <h2 className="text-lg font-bold text-[#1E3560]">Application Under Review</h2>
          </div>
          <p className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>
            Our admissions team will review your application and be in touch within one to two business days.
          </p>
        </div>
      </div>
    )
  }

  if (student.status === 'rejected' || student.status === 'withdrawn') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-6">
        {announcements.length > 0 && <AnnouncementList announcements={announcements} />}
        <div className={CARD} style={{ border: CARD_BORDER }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOUR[student.status] }} />
            <h2 className="text-lg font-bold text-[#1E3560]">
              {student.status === 'rejected' ? 'Application Not Accepted' : 'Enrolment Withdrawn'}
            </h2>
          </div>
          <p className="text-sm mb-5" style={{ color: 'rgba(43,48,58,0.6)' }}>
            {student.status === 'rejected'
              ? 'Unfortunately your application was not accepted at this time. Please contact us for more information.'
              : 'Your enrolment has been withdrawn. Please contact us if you have any questions.'}
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-lg px-6 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: '#1E3560' }}
          >
            Contact Us
          </Link>
        </div>
      </div>
    )
  }

  // ── Enrolled ──────────────────────────────────────────────────────────────

  const now = new Date()
  const assignments = assignmentCourses?.[0]?.assignments ?? []

  // ── Calendar event map ────────────────────────────────────────────────────

  const todayKey = toDateKey(now)

  const eventMap = new Map<string, { assignments: any[]; announcements: SerializedAnnouncement[] }>()

  for (const a of assignments) {
    if (a.duedate > 0) {
      const key = toDateKey(new Date(a.duedate * 1000))
      if (!eventMap.has(key)) eventMap.set(key, { assignments: [], announcements: [] })
      eventMap.get(key)!.assignments.push(a)
    }
  }
  for (const a of announcements) {
    const key = toDateKey(new Date(a.publishedAt))
    if (!eventMap.has(key)) eventMap.set(key, { assignments: [], announcements: [] })
    eventMap.get(key)!.announcements.push(a)
  }

  const workshopMap = new Map<string, SerializedWorkshopDate[]>()
  for (const w of workshopDates) {
    const key = new Date(w.date).toLocaleDateString('en-CA', {
      timeZone: 'America/Edmonton',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    if (!workshopMap.has(key)) workshopMap.set(key, [])
    workshopMap.get(key)!.push(w)
  }

  // ── Calendar grid cells ───────────────────────────────────────────────────

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1)
  // Monday-first offset: Sunday (0) → 6, Monday (1) → 0, …
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const calendarCells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (calendarCells.length % 7 !== 0) calendarCells.push(null)

  const goToPrev = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
    setSelectedDay(null)
  }

  const goToNext = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
    setSelectedDay(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>

      {/* Sticky tab bar */}
      <div
        className="sticky z-40 bg-white shadow-sm"
        style={{ top: 0, borderBottom: '1px solid rgba(30,53,96,0.1)' }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="whitespace-nowrap px-5 py-4 text-sm transition-all duration-150"
                  style={{
                    fontFamily: 'var(--font-montserrat), sans-serif',
                    fontWeight: 700,
                    color: active ? '#1E3560' : 'rgba(30,53,96,0.38)',
                    borderBottom: active ? '2px solid #1E3560' : '2px solid transparent',
                    background: 'none',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab panels */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ── Overview ─────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            {announcements.length > 0 && <AnnouncementList announcements={announcements} />}

            {totalCount > 0 ? (
              <div className={CARD} style={{ border: CARD_BORDER }}>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#378ADD' }}>
                      Course Progress
                    </p>
                    <h2 className="text-lg font-bold text-[#1E3560]">
                      {student.program?.title ?? 'Dental Assisting Certificate'}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: '#1E3560' }}>{progressPct}%</p>
                    <p className="text-xs" style={{ color: 'rgba(43,48,58,0.45)' }}>
                      {completedCount} of {totalCount} modules complete
                    </p>
                  </div>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'rgba(30,53,96,0.08)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: progressPct + '%', backgroundColor: '#378ADD' }}
                  />
                </div>
                {courseComplete && (
                  <p className="text-sm font-semibold mt-4" style={{ color: '#16a34a' }}>
                    Congratulations — programme complete! Your certificate is ready in the Documents tab.
                  </p>
                )}
              </div>
            ) : (
              <div className={CARD} style={{ border: CARD_BORDER }}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLOUR[student.status] ?? '#378ADD' }}
                  />
                  <h2 className="text-lg font-bold text-[#1E3560]">
                    {student.status === 'accepted' ? 'Accepted — Awaiting Enrolment' : 'Welcome'}
                  </h2>
                </div>
                <p className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>
                  {student.status === 'accepted'
                    ? 'Your application has been accepted. Your Moodle course will be set up shortly — check back soon.'
                    : 'Your course content will be available here once modules are set up.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Course ───────────────────────────────────────────────────────── */}
        {activeTab === 'course' && (
          <div className="flex flex-col gap-6">

            <div className={CARD} style={{ border: CARD_BORDER }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#378ADD' }}>Modules</p>
              {totalCount > 0 ? (
                <div className="flex flex-col gap-2">
                  {progressStatuses!.map((item) => (
                    <div
                      key={item.cmid}
                      className="flex items-center justify-between rounded-lg px-4 py-3"
                      style={{ backgroundColor: '#F4F7F9' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.state === 1 ? '#22c55e' : 'rgba(30,53,96,0.2)' }}
                        />
                        <span className="text-sm" style={{ color: 'rgba(43,48,58,0.8)' }}>
                          {activityNames[item.cmid] ?? item.modname}
                        </span>
                      </div>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: item.state === 1 ? '#16a34a' : 'rgba(30,53,96,0.35)' }}
                      >
                        {item.state === 1 ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: 'rgba(43,48,58,0.4)' }}>
                  No modules have been set up yet. Check back soon.
                </p>
              )}
            </div>

            {assignments.length > 0 && (
              <div className={CARD} style={{ border: CARD_BORDER }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#378ADD' }}>Assignments</p>
                <div className="flex flex-col gap-2">
                  {assignments.map((assignment: any) => {
                    const submission = submissions?.assignments
                      ?.find((a: any) => a.assignmentid === assignment.id)
                      ?.submissions
                      ?.find((s: any) => s.userid === student.moodleUserId)

                    const status = submission?.status ?? 'notsubmitted'
                    const gradingStatus = submission?.gradingstatus ?? 'notgraded'

                    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
                      submitted:    { label: 'Submitted',     color: '#16a34a',            bg: 'rgba(34,197,94,0.08)' },
                      draft:        { label: 'Draft Saved',   color: '#E67E22',            bg: 'rgba(230,126,34,0.08)' },
                      notsubmitted: { label: 'Not Submitted', color: 'rgba(43,48,58,0.4)', bg: 'rgba(30,53,96,0.04)' },
                      reopened:     { label: 'Reopened',      color: '#378ADD',            bg: 'rgba(55,138,221,0.08)' },
                    }
                    const gradingConfig: Record<string, { label: string; color: string }> = {
                      graded:                 { label: 'Graded',        color: '#16a34a' },
                      notgraded:              { label: 'Awaiting Grade', color: 'rgba(43,48,58,0.4)' },
                      marking_workflow_state: { label: 'In Review',     color: '#378ADD' },
                    }

                    const ss = statusConfig[status] ?? statusConfig.notsubmitted
                    const gs = gradingConfig[gradingStatus] ?? gradingConfig.notgraded

                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between rounded-lg px-4 py-3"
                        style={{ backgroundColor: '#F4F7F9' }}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium" style={{ color: '#1E3560' }}>{assignment.name}</span>
                          {assignment.duedate > 0 && (
                            <span className="text-xs" style={{ color: 'rgba(43,48,58,0.45)' }}>
                              Due {new Date(assignment.duedate * 1000).toLocaleDateString('en-CA', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: ss.bg, color: ss.color }}
                          >
                            {ss.label}
                          </span>
                          {status === 'submitted' && (
                            <span className="text-xs font-semibold" style={{ color: gs.color }}>{gs.label}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className={CARD} style={{ border: CARD_BORDER }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#378ADD' }}>Access Your Course</p>
              <p className="text-sm mb-5" style={{ color: 'rgba(43,48,58,0.6)' }}>
                Your course content is hosted in Moodle. Click below to open it in a new tab.
              </p>
              <Link
                href={moodleCourseUrl}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white"
                style={{ backgroundColor: '#1E3560' }}
              >
                Go to My Course
              </Link>
            </div>
          </div>
        )}

        {/* ── Calendar ─────────────────────────────────────────────────────── */}
        {activeTab === 'calendar' && (
          <div className={CARD} style={{ border: CARD_BORDER }}>

            {/* Month navigation header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPrev}
                aria-label="Previous month"
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150 hover:bg-[#F4F7F9]"
                style={{ color: '#1E3560' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <p
                className="text-base font-bold"
                style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: '#1E3560' }}
              >
                {MONTH_NAMES[viewMonth]} {viewYear}
              </p>

              <button
                onClick={goToNext}
                aria-label="Next month"
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150 hover:bg-[#F4F7F9]"
                style={{ color: '#1E3560' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_NAMES.map((d) => (
                <div key={d} className="flex items-center justify-center py-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'rgba(30,53,96,0.35)' }}
                  >
                    {d}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={`pad-${idx}`} className="min-h-[52px]" aria-hidden />
                }

                const key     = toDateKey(new Date(viewYear, viewMonth, day))
                const isToday = key === todayKey
                const isSelected = key === selectedDay
                const events    = eventMap.get(key)
                const workshops = workshopMap.get(key)
                const hasEvents = !!events || !!workshops

                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (!hasEvents) { setSelectedDay(null); return }
                      setSelectedDay((prev) => (prev === key ? null : key))
                    }}
                    aria-label={`${day} ${MONTH_NAMES[viewMonth]}${hasEvents ? ', has events' : ''}`}
                    aria-pressed={isSelected}
                    className="relative flex flex-col items-center justify-start pt-2 pb-1.5 rounded-xl min-h-[52px] transition-colors duration-150"
                    style={{
                      backgroundColor: isToday
                        ? '#1E3560'
                        : isSelected
                        ? 'rgba(30,53,96,0.07)'
                        : undefined,
                      cursor: hasEvents ? 'pointer' : 'default',
                      outline: isSelected && !isToday ? '1.5px solid rgba(30,53,96,0.18)' : undefined,
                    }}
                  >
                    <span
                      className="text-sm font-semibold leading-none"
                      style={{
                        color: isToday ? '#ffffff' : 'rgba(30,53,96,0.85)',
                      }}
                    >
                      {day}
                    </span>

                    {/* Event dots */}
                    {hasEvents && (
                      <div className="flex items-center gap-0.5 mt-1.5">
                        {events?.assignments.length ? (
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: isToday ? 'rgba(230,126,34,0.85)' : '#E67E22' }}
                          />
                        ) : null}
                        {events?.announcements.length ? (
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: isToday ? 'rgba(255,255,255,0.65)' : '#378ADD' }}
                          />
                        ) : null}
                        {workshops && [...new Set(workshops.map(w => w.category ?? 'workshop'))].map(cat => {
                          const col = CATEGORY_COLOUR[cat] ?? '#16a34a'
                          return (
                            <div
                              key={cat}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: isToday ? col + 'd9' : col }}
                            />
                          )
                        })}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div
              className="flex items-center gap-5 mt-5 pt-5"
              style={{ borderTop: '1px solid rgba(30,53,96,0.07)' }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#E67E22' }} />
                <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>Assignment due</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#378ADD' }} />
                <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>Announcement</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#16a34a' }} />
                <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>Workshop</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#378ADD' }} />
                <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>Course</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#8b5cf6' }} />
                <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>Guest Speaker</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-md shrink-0"
                  style={{ backgroundColor: '#1E3560' }}
                />
                <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>Today</span>
              </div>
            </div>

            {/* Selected-day event panel */}
            {selectedDay && (eventMap.has(selectedDay) || workshopMap.has(selectedDay)) && (() => {
              const evts = eventMap.get(selectedDay)
              const wks  = workshopMap.get(selectedDay) ?? []
              // Use noon local time to avoid off-by-one from UTC parsing
              const displayDate = new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-CA', {
                timeZone: 'America/Edmonton',
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })
              return (
                <div
                  className="mt-5 rounded-xl p-5"
                  style={{ backgroundColor: '#F4F7F9', border: '1.5px solid rgba(30,53,96,0.09)' }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: '#378ADD' }}
                  >
                    {displayDate}
                  </p>
                  <div className="flex flex-col gap-2">
                    {evts?.assignments.map((a: any) => (
                      <div
                        key={`a-${a.id}`}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 bg-white"
                        style={{ border: '1px solid rgba(30,53,96,0.07)' }}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#E67E22' }} />
                        <div className="min-w-0">
                          <span className="text-sm font-medium" style={{ color: '#1E3560' }}>{a.name}</span>
                          <span className="text-xs ml-2" style={{ color: 'rgba(43,48,58,0.4)' }}>Assignment due</span>
                        </div>
                      </div>
                    ))}
                    {evts?.announcements.map((a) => (
                      <div
                        key={`n-${a._id}`}
                        className="flex items-start gap-3 rounded-lg px-4 py-3 bg-white"
                        style={{ border: '1px solid rgba(30,53,96,0.07)' }}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: '#378ADD' }} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium" style={{ color: '#1E3560' }}>{a.title}</p>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(43,48,58,0.55)' }}>
                            {a.message}
                          </p>
                        </div>
                      </div>
                    ))}
                    {wks.map((w) => {
                      const catCol = CATEGORY_COLOUR[w.category ?? 'workshop'] ?? '#16a34a'
                      const catLbl = CATEGORY_LABEL[w.category ?? 'workshop'] ?? 'Workshop'
                      return (
                      <div
                        key={`w-${w._id}`}
                        className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 bg-white"
                        style={{ border: '1px solid rgba(30,53,96,0.07)' }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: catCol }} />
                          <div className="min-w-0">
                            <span className="text-sm font-medium" style={{ color: '#1E3560' }}>{w.workshop}</span>
                            <span className="text-xs ml-2" style={{ color: 'rgba(43,48,58,0.4)' }}>{catLbl}</span>
                          </div>
                        </div>
                        {registeredDateIds.has(w._id) ? (
                          <span
                            className="shrink-0 rounded-full px-3 py-1 text-xs font-bold"
                            style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                          >
                            Registered ✓
                          </span>
                        ) : waitlistJoinedIds.has(w._id) ? (
                          <span
                            className="shrink-0 rounded-full px-3 py-1 text-xs font-bold"
                            style={{ backgroundColor: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}
                          >
                            On Waitlist ✓
                          </span>
                        ) : (w.registered ?? 0) >= w.capacity ? (
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <button
                              onClick={() => joinWaitlist(w)}
                              disabled={waitlistLoadingIds.has(w._id)}
                              className="rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                              style={{ backgroundColor: '#E67E22' }}
                            >
                              {waitlistLoadingIds.has(w._id) ? '…' : 'Join Waitlist'}
                            </button>
                            {waitlistErrors[w._id] && (
                              <p className="text-[10px]" style={{ color: '#dc2626' }}>{waitlistErrors[w._id]}</p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => { setWorkshopModal(w); setModalError('') }}
                            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                            style={{ backgroundColor: '#E67E22' }}
                          >
                            Register
                          </button>
                        )}
                      </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

          </div>
        )}

        {/* ── Grades ───────────────────────────────────────────────────────── */}
        {activeTab === 'grades' && (
          <div className="flex flex-col gap-6">
            {gradeItems && gradeItems.length > 0 ? (
              <div className={CARD} style={{ border: CARD_BORDER }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#378ADD' }}>Grades</p>
                <div className="flex flex-col gap-2">
                  {gradeItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg px-4 py-3"
                      style={{ backgroundColor: '#F4F7F9' }}
                    >
                      <span className="text-sm" style={{ color: 'rgba(43,48,58,0.8)' }}>
                        {item.itemname ?? 'Course Total'}
                      </span>
                      <span className="text-sm font-bold" style={{ color: '#1E3560' }}>
                        {item.gradeformatted ?? '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`${CARD} text-center`} style={{ border: CARD_BORDER }}>
                <p className="text-sm py-4" style={{ color: 'rgba(43,48,58,0.4)' }}>
                  No grades available yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Payments ─────────────────────────────────────────────────────── */}
        {activeTab === 'payments' && (
          <div className="flex flex-col gap-6">
            <div className={CARD} style={{ border: CARD_BORDER }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#378ADD' }}>
                    Tuition Payment
                  </p>
                  <h2 className="text-lg font-bold text-[#1E3560]">
                    {student.paymentStatus === 'paid' ? 'Tuition Paid' : 'Payment Required'}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'rgba(43,48,58,0.6)' }}>
                    {student.paymentStatus === 'paid'
                      ? 'Your tuition has been received. Thank you.'
                      : `Your tuition of $${student.tuitionAmount?.toLocaleString() ?? '2,500'} CAD is outstanding.`}
                  </p>
                </div>
                <div>
                  {student.paymentStatus === 'paid' ? (
                    <div
                      className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                      style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                    >
                      Paid
                    </div>
                  ) : (
                    <PayTuitionButton />
                  )}
                </div>
              </div>
            </div>

            {paymentHistory && paymentHistory.length > 0 ? (
              <div className={CARD} style={{ border: CARD_BORDER }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#378ADD' }}>Payment History</p>
                <div className="flex flex-col gap-2">
                  {paymentHistory.map((charge) => (
                    <div
                      key={charge.id}
                      className="flex items-center justify-between rounded-lg px-4 py-3"
                      style={{ backgroundColor: '#F4F7F9' }}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium" style={{ color: '#1E3560' }}>
                          {charge.description ?? 'Tuition Payment'}
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(43,48,58,0.45)' }}>
                          {new Date(charge.created * 1000).toLocaleDateString('en-CA', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold" style={{ color: '#1E3560' }}>
                          ${(charge.amount / 100).toFixed(2)} {charge.currency.toUpperCase()}
                        </span>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: charge.status === 'succeeded' ? 'rgba(34,197,94,0.08)' : 'rgba(220,38,38,0.08)',
                            color: charge.status === 'succeeded' ? '#16a34a' : '#dc2626',
                          }}
                        >
                          {charge.status === 'succeeded' ? 'Paid' : charge.status}
                        </span>
                        {charge.receipt_url && (
                          <a
                            href={charge.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold"
                            style={{ color: '#378ADD' }}
                          >
                            Receipt
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`${CARD} text-center`} style={{ border: CARD_BORDER }}>
                <p className="text-sm py-4" style={{ color: 'rgba(43,48,58,0.4)' }}>No payment history yet.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Documents ────────────────────────────────────────────────────── */}
        {activeTab === 'documents' && (
          <div className="flex flex-col gap-6">
            {courseComplete ? (
              <div className={CARD} style={{ border: CARD_BORDER }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#378ADD' }}>
                  Certificate of Completion
                </p>
                <p className="text-sm mb-5" style={{ color: 'rgba(43,48,58,0.6)' }}>
                  Congratulations! You have completed the programme. Download your certificate below.
                </p>
                <Link
                  href="/api/students/certificate"
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white"
                  style={{ backgroundColor: '#E67E22' }}
                >
                  Download Certificate
                </Link>
              </div>
            ) : (
              <div className={CARD} style={{ border: CARD_BORDER }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#378ADD' }}>
                  Certificate of Completion
                </p>
                <p className="text-sm" style={{ color: 'rgba(43,48,58,0.45)' }}>
                  Your certificate will be available once you complete all modules
                  {totalCount > 0 && ` (${completedCount} of ${totalCount} complete)`}.
                </p>
                {totalCount > 0 && (
                  <div className="mt-4">
                    <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'rgba(30,53,96,0.08)' }}>
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: progressPct + '%', backgroundColor: '#378ADD' }}
                      />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(43,48,58,0.4)' }}>{progressPct}% complete</p>
                  </div>
                )}
              </div>
            )}

            <div className={CARD} style={{ border: CARD_BORDER }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#378ADD' }}>
                Academic Transcript
              </p>
              <p className="text-sm mb-5" style={{ color: 'rgba(43,48,58,0.6)' }}>
                Download your official academic transcript showing your grades and module completion.
              </p>
              <Link
                href="/api/students/transcript"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white"
                style={{ backgroundColor: '#1E3560' }}
              >
                Download Transcript
              </Link>
            </div>

            {(student.status === 'accepted' || student.status === 'enrolled') && student.moodleUserId && (
              <div className={CARD} style={{ border: CARD_BORDER }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#378ADD' }}>
                  Student ID Card
                </p>
                <p className="text-sm mb-5" style={{ color: 'rgba(43,48,58,0.6)' }}>
                  Download your digital student ID card as a PDF.
                </p>
                <a
                  href="/api/students/id-card"
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white"
                  style={{ backgroundColor: '#378ADD' }}
                >
                  Download Student ID
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── Profile ──────────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6">
            <div className={CARD} style={{ border: CARD_BORDER }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: '#378ADD' }}>Your Profile</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name',  value: student.firstName + ' ' + student.lastName },
                  ...(student.moodleUserId ? [{ label: 'Student ID', value: String(student.moodleUserId + 99999) }] : []),
                  { label: 'Email',      value: student.email },
                  { label: 'Phone',      value: student.phone ?? '—' },
                  { label: 'Programme',  value: student.program?.title ?? '—' },
                  {
                    label: 'Applied',
                    value: student.applicationDate
                      ? new Date(student.applicationDate).toLocaleDateString('en-CA', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })
                      : '—',
                  },
                  {
                    label: 'Accepted',
                    value: student.acceptedDate
                      ? new Date(student.acceptedDate).toLocaleDateString('en-CA', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })
                      : '—',
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-1"
                      style={{ color: 'rgba(30,53,96,0.4)' }}
                    >
                      {label}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#1E3560' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Workshop registration modal ── */}
      {workshopModal && (() => {
        const pricing     = getWorkshopPricing(workshopModal.workshop)
        const displayDate = formatWorkshopDate(workshopModal.date)
        return (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
              onClick={() => { setWorkshopModal(null); setModalError('') }}
              aria-hidden
            />
            {/* Panel */}
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none px-4 pb-4 sm:pb-0">
              <div
                className="pointer-events-auto w-full sm:max-w-md rounded-2xl p-6 sm:p-8"
                style={{ backgroundColor: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: '1.5px solid rgba(30,53,96,0.09)' }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="workshop-modal-title"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#378ADD' }}>
                      Workshop Registration
                    </p>
                    <h2
                      id="workshop-modal-title"
                      className="text-sm font-bold leading-snug"
                      style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: '#1E3560' }}
                    >
                      {workshopModal.workshop}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: 'rgba(43,48,58,0.5)' }}>{displayDate}</p>
                  </div>
                  <button
                    onClick={() => { setWorkshopModal(null); setModalError('') }}
                    aria-label="Close modal"
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#F4F7F9]"
                    style={{ color: 'rgba(43,48,58,0.4)' }}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>

                {/* Registrant summary */}
                <div className="rounded-xl px-4 py-3 mb-5" style={{ backgroundColor: '#F4F7F9' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>Name</span>
                    <span className="text-xs font-semibold" style={{ color: '#1E3560' }}>
                      {student?.firstName} {student?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>Email</span>
                    <span className="text-xs font-semibold truncate ml-4" style={{ color: '#1E3560' }}>{userEmail}</span>
                  </div>
                </div>

                {/* Pricing */}
                {pricing ? (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>Workshop fee</span>
                      <span className="text-sm font-semibold" style={{ color: '#1E3560' }}>
                        ${pricing.base.toFixed(2)} CAD
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>Processing fee</span>
                      <span className="text-sm font-semibold" style={{ color: '#1E3560' }}>
                        ${pricing.fee.toFixed(2)} CAD
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: '1px solid rgba(30,53,96,0.08)' }}
                    >
                      <span className="text-sm font-bold" style={{ color: '#1E3560' }}>Total due</span>
                      <span className="text-base font-bold" style={{ color: '#1E3560' }}>
                        ${pricing.total.toFixed(2)} CAD
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm mb-5" style={{ color: 'rgba(43,48,58,0.5)' }}>
                    Contact us for pricing information.
                  </p>
                )}

                {/* Error */}
                {modalError && (
                  <p
                    className="text-xs font-semibold mb-4 px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
                  >
                    {modalError}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setWorkshopModal(null); setModalError('') }}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[#e8ecf0]"
                    style={{ backgroundColor: '#F4F7F9', color: '#1E3560' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={proceedToPayment}
                    disabled={modalLoading || !pricing}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#E67E22' }}
                  >
                    {modalLoading ? 'Redirecting…' : 'Proceed to Payment'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )
      })()}

    </div>
  )
}

// ── Announcement list sub-component ──────────────────────────────────────────

function AnnouncementList({ announcements }: { announcements: SerializedAnnouncement[] }) {
  const typeStyles: Record<string, { bg: string; border: string; color: string; label: string }> = {
    info:      { bg: 'rgba(55,138,221,0.06)', border: '#378ADD', color: '#1E3560', label: 'Info'      },
    important: { bg: 'rgba(220,38,38,0.06)',  border: '#dc2626', color: '#dc2626', label: 'Important' },
    reminder:  { bg: 'rgba(230,126,34,0.06)', border: '#E67E22', color: '#E67E22', label: 'Reminder'  },
    success:   { bg: 'rgba(34,197,94,0.06)',  border: '#22c55e', color: '#16a34a', label: 'Good News' },
  }

  return (
    <div className="flex flex-col gap-3">
      {announcements.map((a) => {
        const s = typeStyles[a.type] ?? typeStyles.info
        return (
          <div
            key={a._id}
            className="rounded-xl p-5"
            style={{ backgroundColor: s.bg, borderLeft: `4px solid ${s.border}` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.label}</span>
              <span className="text-xs" style={{ color: 'rgba(43,48,58,0.4)' }}>
                {new Date(a.publishedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#1E3560' }}>{a.title}</p>
            <p className="text-sm" style={{ color: 'rgba(43,48,58,0.7)' }}>{a.message}</p>
          </div>
        )
      })}
    </div>
  )
}
