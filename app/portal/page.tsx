import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { getMoodleProgress, getMoodleGrades, getMoodleCourseContents } from '@/lib/moodle/client'
import Link from 'next/link'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export default async function PortalPage() {
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress

  const student = await client.fetch(
    `*[_type == "student" && email == $email][0]{
      _id, firstName, lastName, email, phone, status,
      moodleUserId, applicationDate, acceptedDate,
      program->{ _id, title, moodleCourseId }
    }`,
    { email }
  )

  const moodleCourseId = student?.program?.moodleCourseId ?? Number(process.env.MOODLE_COURSE_DAC_DD)
  const moodleCourseUrl = `${process.env.MOODLE_URL}/course/view.php?id=${moodleCourseId}`

  let progress = null
  let grades = null
  if (student?.moodleUserId && moodleCourseId) {
    try {
      progress = await getMoodleProgress(student.moodleUserId, moodleCourseId)
      grades = await getMoodleGrades(student.moodleUserId, moodleCourseId)
    } catch (error) {
      console.error('Moodle fetch error:', error)
    }
  }

  let courseContents = null
  if (moodleCourseId) {
    try {
      courseContents = await getMoodleCourseContents(moodleCourseId)
    } catch (error) {
      console.error('Failed to fetch course contents:', error)
    }
  }

  // Build a map of cmid -> activity name
  const activityNames: Record<number, string> = {}
  if (courseContents) {
    for (const section of courseContents) {
      for (const module of section.modules ?? []) {
        activityNames[module.id] = module.name
      }
    }
  }

  const completedCount = progress?.statuses?.filter((s: any) => s.state === 1).length ?? 0
  const totalCount = progress?.statuses?.length ?? 0
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const statusColour: Record<string, string> = {
    pending: '#E67E22',
    accepted: '#378ADD',
    enrolled: '#22c55e',
    rejected: '#dc2626',
    withdrawn: '#888',
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#1E3560' }} className="px-6 py-12">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Student Portal
            </p>
            <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              Welcome back, {student?.firstName ?? user?.firstName ?? 'Student'}.
            </h1>
            {student?.program?.title && (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {student.program.title}
              </p>
            )}
          </div>
          {student && (
            <div
              className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: statusColour[student.status] ?? '#fff',
                border: `1px solid ${statusColour[student.status] ?? 'rgba(255,255,255,0.2)'}`,
              }}
            >
              {student.status}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-6">

        {/* No application */}
        {!student && (
          <div className="rounded-2xl p-10 text-center bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
            <h2 className="text-lg font-bold text-[#1E3560] mb-2">No Application Found</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(43,48,58,0.6)' }}>
              No application was found for {email}. If you have applied, make sure you used the same email address.
            </p>
            <Link
              href="/apply"
              className="rounded-lg px-6 py-2.5 text-sm font-bold text-white"
              style={{ backgroundColor: '#E67E22' }}
            >
              Apply Now
            </Link>
          </div>
        )}

        {/* Pending */}
        {student && student.status === 'pending' && (
          <div className="rounded-2xl p-8 bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#E67E22' }} />
              <h2 className="text-lg font-bold text-[#1E3560]">Application Under Review</h2>
            </div>
            <p className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>
              Our admissions team will review your application and be in touch within one to two business days.
            </p>
          </div>
        )}

        {/* Enrolled */}
        {student && (student.status === 'accepted' || student.status === 'enrolled') && (
          <>
            {/* Progress card */}
            <div className="rounded-2xl p-8 bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
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

              {/* Progress bar */}
              <div className="w-full rounded-full h-2 mb-6" style={{ backgroundColor: 'rgba(30,53,96,0.08)' }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%`, backgroundColor: '#378ADD' }}
                />
              </div>

              {/* Module list */}
              {totalCount > 0 ? (
                <div className="flex flex-col gap-2">
                  {progress.statuses.map((item: any) => (
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

            {/* Grades card */}
            {grades?.usergrades?.[0]?.gradeitems?.length > 0 && (
              <div className="rounded-2xl p-8 bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#378ADD' }}>
                  Grades
                </p>
                <div className="flex flex-col gap-2">
                  {grades.usergrades[0].gradeitems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg px-4 py-3"
                      style={{ backgroundColor: '#F4F7F9' }}
                    >
                      <span className="text-sm" style={{ color: 'rgba(43,48,58,0.8)' }}>
                        {item.itemname ?? 'Course Total'}
                      </span>
                      <span className="text-sm font-bold" style={{ color: '#1E3560' }}>
                        {item.gradeformatted ?? '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile card */}
            <div className="rounded-2xl p-8 bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#378ADD' }}>
                Your Profile
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: `${student.firstName} ${student.lastName}` },
                  { label: 'Email', value: student.email },
                  { label: 'Phone', value: student.phone ?? '-' },
                  { label: 'Program', value: student.program?.title ?? '-' },
                  { label: 'Applied', value: student.applicationDate ? new Date(student.applicationDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' },
                  { label: 'Accepted', value: student.acceptedDate ? new Date(student.acceptedDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(30,53,96,0.4)' }}>
                      {label}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#1E3560' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Moodle */}
            <div className="rounded-2xl p-8 bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#378ADD' }}>
                Access Your Course
              </p>
              <p className="text-sm mb-5" style={{ color: 'rgba(43,48,58,0.6)' }}>
                Your course content is hosted in Moodle. Click below to open it.
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
          </>
        )}

      </div>
    </main>
  )
}