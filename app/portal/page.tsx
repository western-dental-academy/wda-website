import { currentUser } from '@clerk/nextjs/server'
import { SignOutButton } from '@clerk/nextjs'
import { createClient } from '@sanity/client'
import { getMoodleProgress, getMoodleGrades, getMoodleCourseContents, getMoodleAssignments, getMoodleSubmissions } from '@/lib/moodle/client'
import { stripe } from '@/lib/stripe/client'
import PortalTabs from '@/components/PortalTabs'
import type { SerializedCharge } from '@/components/PortalTabs'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const STATUS_COLOUR: Record<string, string> = {
  pending:   '#E67E22',
  accepted:  '#378ADD',
  enrolled:  '#22c55e',
  rejected:  '#dc2626',
  withdrawn: '#888888',
}

export default async function PortalPage() {
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''

  const student = await client.fetch(
    `*[_type == "student" && email == $email][0]{
      _id, firstName, lastName, email, phone, status,
      moodleUserId, applicationDate, acceptedDate,
      paymentStatus, tuitionAmount, stripeCustomerId,
      program->{ _id, title, moodleCourseId }
    }`,
    { email }
  )

  // Stripe payment history — serialise to plain objects
  let paymentHistory: SerializedCharge[] | null = null
  if (student?.stripeCustomerId) {
    try {
      const charges = await stripe.charges.list({ customer: student.stripeCustomerId, limit: 10 })
      paymentHistory = charges.data.map((c) => ({
        id: c.id,
        amount: c.amount,
        currency: c.currency,
        status: c.status,
        created: c.created,
        description: c.description ?? null,
        receipt_url: c.receipt_url ?? null,
      }))
    } catch (error) {
      console.error('Stripe payment history error:', error)
    }
  }

  // Announcements
  const announcements = await client.fetch(
    `*[_type == "announcement" && active == true && (!defined(expiresAt) || expiresAt > now()) && (!defined(program) || program._ref == $programId)] | order(publishedAt desc)[0...5]{
      _id, title, message, type, publishedAt
    }`,
    { programId: student?.program?._id ?? '' }
  )

  const moodleCourseId = student?.program?.moodleCourseId ?? Number(process.env.MOODLE_COURSE_DAC_DD)
  const moodleCourseUrl = (process.env.MOODLE_URL ?? '') + '/course/view.php?id=' + moodleCourseId

  let progress = null
  let grades = null
  let courseContents = null
  let assignments = null
  let submissions = null

  if (student?.moodleUserId && moodleCourseId) {
    try {
      ;[progress, grades, courseContents] = await Promise.all([
        getMoodleProgress(student.moodleUserId, moodleCourseId),
        getMoodleGrades(student.moodleUserId, moodleCourseId),
        getMoodleCourseContents(moodleCourseId),
      ])
    } catch (error) {
      console.error('Moodle fetch error:', error)
    }

    try {
      assignments = await getMoodleAssignments(moodleCourseId)
      if (assignments?.courses?.[0]?.assignments?.length > 0) {
        const assignmentIds = assignments.courses[0].assignments.map((a: any) => a.id)
        submissions = await getMoodleSubmissions(assignmentIds)
      }
    } catch (error) {
      console.error('Assignment fetch error:', error)
    }
  }

  // Build activity name map from course contents
  const activityNames: Record<number, string> = {}
  if (courseContents) {
    for (const section of courseContents) {
      for (const mod of section.modules ?? []) {
        activityNames[mod.id] = mod.name
      }
    }
  }

  const progressStatuses = progress?.statuses ?? null
  const gradeItems = grades?.usergrades?.[0]?.gradeitems ?? null
  const assignmentCourses = assignments?.courses ?? null

  const completedCount = progressStatuses?.filter((s: any) => s.state === 1).length ?? 0
  const totalCount = progressStatuses?.length ?? 0
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const courseComplete = totalCount > 0 && completedCount === totalCount
  const isEnrolled = student && (student.status === 'accepted' || student.status === 'enrolled')

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#1E3560' }} className="px-6 py-12">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Student Portal
            </p>
            <h1
              className="text-3xl font-bold text-white mb-1"
              style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Welcome back, {student?.firstName ?? user?.firstName ?? 'Student'}.
            </h1>
            {student?.program?.title && (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {student.program.title}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {student && (
              <div
                className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: STATUS_COLOUR[student.status] ?? '#fff',
                  border: '1px solid ' + (STATUS_COLOUR[student.status] ?? 'rgba(255,255,255,0.2)'),
                }}
              >
                {student.status}
              </div>
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

      {/* Tab content */}
      <PortalTabs
        student={student ?? null}
        userEmail={email}
        announcements={announcements ?? []}
        progressStatuses={progressStatuses}
        gradeItems={gradeItems}
        assignmentCourses={assignmentCourses}
        submissions={submissions}
        activityNames={activityNames}
        completedCount={completedCount}
        totalCount={totalCount}
        progressPct={progressPct}
        courseComplete={courseComplete}
        isEnrolled={!!isEnrolled}
        moodleCourseUrl={moodleCourseUrl}
        paymentHistory={paymentHistory}
      />

    </main>
  )
}
