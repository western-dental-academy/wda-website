import { auth, currentUser } from '@clerk/nextjs/server'
import { SignOutButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { createClient } from '@sanity/client'
import Link from 'next/link'
import { type DateGroup, type WorkshopRegistration, type WorkshopWaitlistEntry } from '@/components/AdminWorkshopRegistrations'
import { type WorkshopDateItem } from '@/components/AdminWorkshopDates'
import { type Task } from '@/components/AdminTaskManager'
import { type FeedbackEntry, type QRFeedbackEntry } from '@/components/admin/AdminWorkshopFeedback'
import AdminTabs from '@/components/AdminTabs'
import { stripe } from '@/lib/stripe/client'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'lance@westerndentalacademy.com',
  'ryan@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

const FINANCIAL_EMAILS = [
  'aiden@westerndentalacademy.com',
  'lance@westerndentalacademy.com',
  'ryan@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

const SANITY_EMAILS = ['aiden@westerndentalacademy.com']

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''

  if (!ADMIN_EMAILS.includes(email)) {
    redirect('/')
  }

  const canViewFinancials = FINANCIAL_EMAILS.includes(email)
  const canViewSanity     = SANITY_EMAILS.includes(email)

  const students = await client.fetch(
    `*[_type == "student"] | order(applicationDate desc) {
      _id, firstName, lastName, email, phone, status, paymentStatus,
      applicationDate, acceptedDate, tuitionAmount, cohort, notes,
      moodleUserId, program->{ title },
      transcriptFile { asset->{ _id, url, originalFilename } }
    }`
  )

  const stats = {
    total: students.length,
    pending: students.filter((s: any) => s.status === 'pending').length,
    accepted: students.filter((s: any) => s.status === 'accepted').length,
    enrolled: students.filter((s: any) => s.status === 'enrolled').length,
    paid: students.filter((s: any) => s.paymentStatus === 'paid').length,
  }

  // Parse referral sources from notes
  const referralCounts: Record<string, number> = {}
  students.forEach((student: any) => {
    if (student.notes) {
      const match = student.notes.match(/Referral: (.+)/m)
      if (match) {
        const source = match[1].trim()
        referralCounts[source] = (referralCounts[source] ?? 0) + 1
      }
    }
  })

  const referralData = Object.entries(referralCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [announcements, programmes, workshopDates, workshopRegs, workshopWaitlist, staffTimeOff, rawTasks, clockEntries, pendingTimeOff, workshopFeedback, qrFeedback] = await Promise.all([
    client.fetch(
      `*[_type == "announcement" && active == true] | order(publishedAt desc){
        _id, title, message, type, publishedAt, expiresAt,
        program->{ _id, title }
      }`
    ),
    client.fetch(
      `*[_type == "program"] | order(title asc){ _id, title }`
    ),
    client.fetch(
      `*[_type == "workshopDate"] | order(date asc){ _id, date, active, offering->{ _id, title, category, capacity, hasVirtualOption, virtualPrice, price } }`
    ),
    client.fetch(
      `*[_type == "workshopRegistration"] | order(registeredAt desc){
        _id, firstName, lastName, pronouns, mediaConsent, email, workshop, registeredAt,
        stripePaymentStatus, checkedIn, checkedInAt, workshopDateId, certificateSent,
        deliveryMethod, feedbackToken, feedbackRating, feedbackEnjoyedMost, feedbackImprovement,
        feedbackWouldRecommend, feedbackSubmittedAt
      }`
    ),
    client.fetch(
      `*[_type == "workshopWaitlist"] | order(joinedAt asc){
        _id, firstName, lastName, email, phone, workshopDateId, joinedAt, notified, notifiedAt
      }`
    ),
    client.fetch(
      `*[_type == "timeOffRequest" && status == "approved"] | order(startDate asc){
        _id, type, startDate, endDate, startTime, endTime,
        staffMember->{ fullName }
      }`
    ),
    client.fetch(
      `*[_type == "task"] | order(dueDate asc, createdAt desc){
        _id, title, description, assignedTo, assignedBy,
        dueDate, priority, status, createdAt, completedAt
      }`
    ),
    client.fetch(
      `*[_type == "hoursLog" && (clockIn >= $since || !defined(clockOut))] | order(clockIn desc)[0...100]{
        _id, clockIn, clockOut, notes,
        staffMember->{ _id, fullName }
      }`,
      { since: sevenDaysAgo }
    ),
    client.fetch(
      `*[_type == "timeOffRequest" && status == "pending"] | order(submittedAt asc){
        _id, type, startDate, endDate, halfDay, reason, submittedAt,
        staffMember->{ _id, fullName, email }
      }`
    ),
    client.fetch(
      `*[_type == "workshopRegistration" && defined(feedbackSubmittedAt)] | order(feedbackSubmittedAt desc){
        _id, firstName, lastName, workshop,
        feedbackRating, feedbackEnjoyedMost, feedbackImprovement,
        feedbackWouldRecommend, feedbackSubmittedAt
      }`
    ),
    client.fetch(
      `*[_type == "workshopFeedback"] | order(submittedAt desc){
        _id, workshopDateId, workshopName, rating,
        enjoyedMost, improvement, wouldRecommend, submittedAt
      }`
    ),
  ])
  const tasks = rawTasks as Task[]

  // ── Revenue metrics (financial staff only) ─────────────────────────────────

  let totalRevenue     = 0
  let thisMonthRevenue = 0
  let outstandingBalance = 0
  let totalRefunded    = 0
  let thisMonthRefunded = 0

  if (canViewFinancials) {
    let succeededCharges: { amount: number; amount_refunded: number; created: number }[] = []
    try {
      const charges = await stripe.charges.list({ limit: 100 })
      succeededCharges = charges.data
        .filter((c) => c.status === 'succeeded')
        .map((c) => ({ amount: c.amount, amount_refunded: c.amount_refunded ?? 0, created: c.created }))
    } catch (err) {
      console.error('Stripe revenue fetch error:', err)
    }

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).getTime() / 1000

    totalRevenue     = succeededCharges.reduce((sum, c) => sum + (c.amount - c.amount_refunded), 0) / 100
    thisMonthRevenue = succeededCharges
      .filter((c) => c.created >= startOfMonth)
      .reduce((sum, c) => sum + (c.amount - c.amount_refunded), 0) / 100
    totalRefunded    = succeededCharges.reduce((sum, c) => sum + c.amount_refunded, 0) / 100
    thisMonthRefunded = succeededCharges
      .filter((c) => c.created >= startOfMonth)
      .reduce((sum, c) => sum + c.amount_refunded, 0) / 100
    outstandingBalance = students
      .filter((s: any) =>
        (s.status === 'accepted' || s.status === 'enrolled') &&
        s.paymentStatus !== 'paid' &&
        s.tuitionAmount
      )
      .reduce((sum: number, s: any) => sum + (s.tuitionAmount as number), 0)
  }

  // Build DateGroup array for workshop registrations
  const dateGroups: DateGroup[] = (workshopDates as Array<{
    _id: string
    date: string
    active: boolean
    offering: { title: string; category: string; capacity: number } | null
  }>)
    .filter((d) => d.active !== false)
    .map((d) => ({
      dateId: d._id,
      workshop: d.offering?.title ?? '',
      date: d.date,
      capacity: d.offering?.capacity ?? 0,
      registrations: (workshopRegs as WorkshopRegistration[]).filter((r) => r.workshopDateId === d._id),
      waitlist: (workshopWaitlist as WorkshopWaitlistEntry[]).filter((w) => w.workshopDateId === d._id),
    }))

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1E3560' }} className="px-4 sm:px-6 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Admin Dashboard
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              WDA Hub
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://learn.westerndentalacademy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
            >
              Go to Moodle ↗
            </a>
            {canViewSanity && (
              <Link
                href="/studio/structure/students"
                className="rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
              >
                Open Sanity Studio
              </Link>
            )}
            <SignOutButton signOutOptions={{ redirectUrl: '/sign-in' }}>
              <button
                className="rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
              >
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      <AdminTabs
        stats={stats}
        tasks={tasks}
        currentUserEmail={email}
        staffTimeOff={staffTimeOff}
        workshopDates={workshopDates}
        students={students}
        announcements={announcements}
        programmes={programmes}
        referralData={referralData}
        canViewFinancials={canViewFinancials}
        workshopRegs={workshopRegs as WorkshopRegistration[]}
        workshopWaitlist={workshopWaitlist as WorkshopWaitlistEntry[]}
        dateGroups={dateGroups}
        totalRevenue={totalRevenue}
        thisMonthRevenue={thisMonthRevenue}
        outstandingBalance={outstandingBalance}
        totalRefunded={totalRefunded}
        thisMonthRefunded={thisMonthRefunded}
        clockEntries={clockEntries}
        pendingTimeOff={pendingTimeOff}
        workshopFeedback={workshopFeedback as FeedbackEntry[]}
        qrFeedback={qrFeedback as QRFeedbackEntry[]}
      />
    </main>
  )
}