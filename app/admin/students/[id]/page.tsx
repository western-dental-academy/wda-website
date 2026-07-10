import { auth, currentUser } from '@clerk/nextjs/server'
import { SignOutButton } from '@clerk/nextjs'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@sanity/client'
import { stripe } from '@/lib/stripe/client'
import { getMoodleProgress, getMoodleGrades, getMoodleCourseContents } from '@/lib/moodle/client'
import StudentActions from '@/components/StudentActions'

// ── Auth ──────────────────────────────────────────────────────────────────────

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

// ── Sanity ────────────────────────────────────────────────────────────────────

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function parseNotes(notes: string | null | undefined) {
  if (!notes) return []
  return notes
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.includes(': '))
    .map(line => {
      const idx = line.indexOf(': ')
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 2).trim() }
    })
    .filter(({ value }) => value && value !== 'undefined' && value !== 'null')
}

function buildTranscriptUrl(assetId: string) {
  const path = assetId.replace('file-', '').replace(/-([a-z0-9]+)$/, '.$1')
  return `https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production/${path}`
}

function isImageAsset(assetId: string) {
  return /-(?:jpg|jpeg|png)$/i.test(assetId)
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

function fmtUnix(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white overflow-hidden ${className}`} style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
      {title && (
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(30,53,96,0.08)' }}>
          <h2
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: '#4A9FD4', fontFamily: 'var(--font-montserrat), sans-serif' }}
          >
            {title}
          </h2>
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</dl>
}

function Field({ label, value, wide }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <dt className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(30,53,96,0.4)' }}>
        {label}
      </dt>
      <dd className="text-sm font-medium leading-snug break-words" style={{ color: value ? '#1E3560' : 'rgba(30,53,96,0.3)' }}>
        {value || '—'}
      </dd>
    </div>
  )
}

function Divider() {
  return <div className="my-5" style={{ borderTop: '1px solid rgba(30,53,96,0.07)' }} />
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const adminUser = await currentUser()
  const adminEmail = adminUser?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(adminEmail)) redirect('/')

  const { id } = await params

  const student = await client.fetch(
    `*[_id == $id][0]{
      _id, firstName, lastName, email, phone, status, paymentStatus,
      applicationDate, acceptedDate, tuitionAmount, cohort, notes,
      moodleUserId, stripeCustomerId, stripePaymentIntentId, clerkUserId,
      certificateId, certificateIssuedDate,
      program->{ _id, title, moodleCourseId },
      transcriptFile { asset->{ _id, url, originalFilename } }
    }`,
    { id }
  )

  if (!student) notFound()

  // ── Stripe payment history ────────────────────────────────────────────────

  let charges: {
    id: string
    amount: number
    currency: string
    status: string
    created: number
    description: string | null
    receipt_url: string | null
  }[] = []

  if (student.stripeCustomerId) {
    try {
      const result = await stripe.charges.list({ customer: student.stripeCustomerId, limit: 20 })
      charges = result.data.map(c => ({
        id:          c.id,
        amount:      c.amount,
        currency:    c.currency,
        status:      c.status,
        created:     c.created,
        description: c.description ?? null,
        receipt_url: c.receipt_url ?? null,
      }))
    } catch (err) {
      console.error('Stripe charges error:', err)
    }
  }

  // ── Moodle data ───────────────────────────────────────────────────────────

  const moodleCourseId: number | null = student.program?.moodleCourseId ?? null
  const moodleCourseUrl = moodleCourseId
    ? `${process.env.MOODLE_URL ?? ''}/course/view.php?id=${moodleCourseId}`
    : null

  let progressStatuses: any[] | null = null
  let gradeItems: any[] | null = null
  let activityNames: Record<number, string> = {}

  if (student.moodleUserId && moodleCourseId) {
    try {
      const [progress, grades, courseContents] = await Promise.all([
        getMoodleProgress(student.moodleUserId, moodleCourseId),
        getMoodleGrades(student.moodleUserId, moodleCourseId),
        getMoodleCourseContents(moodleCourseId),
      ])
      progressStatuses = progress?.statuses ?? null
      gradeItems       = grades?.usergrades?.[0]?.gradeitems ?? null
      if (courseContents) {
        for (const section of courseContents) {
          for (const mod of section.modules ?? []) {
            activityNames[mod.id] = mod.name
          }
        }
      }
    } catch (err) {
      console.error('Moodle data error:', err)
    }
  }

  const completedCount = progressStatuses?.filter((s: any) => s.state === 1).length ?? 0
  const totalCount     = progressStatuses?.length ?? 0
  const progressPct    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const courseComplete = totalCount > 0 && completedCount === totalCount

  // ── Derived values ────────────────────────────────────────────────────────

  const studentId   = student.moodleUserId ? student.moodleUserId + 99999 : null
  const parsedNotes = parseNotes(student.notes)
  const transcriptAsset = student.transcriptFile?.asset

  const paidCharge = charges.find(c => c.status === 'succeeded')
  const outstanding = (student.status === 'accepted' || student.status === 'enrolled')
    && student.paymentStatus !== 'paid'
    && student.tuitionAmount
    ? student.tuitionAmount
    : 0

  // ── Timeline events ───────────────────────────────────────────────────────

  const timeline = [
    student.applicationDate
      ? { label: 'Application Submitted', date: fmtDate(student.applicationDate), colour: '#E67E22' }
      : null,
    student.acceptedDate
      ? { label: 'Application Accepted',  date: fmtDate(student.acceptedDate),    colour: '#378ADD' }
      : null,
    paidCharge
      ? { label: 'Payment Received',      date: fmtUnix(paidCharge.created),      colour: '#22c55e' }
      : null,
    student.certificateIssuedDate
      ? { label: 'Certificate Issued',    date: fmtDate(student.certificateIssuedDate), colour: '#4A9FD4' }
      : null,
  ].filter(Boolean) as { label: string; date: string; colour: string }[]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>

      {/* ── Header ── */}
      <div style={{ backgroundColor: '#1E3560' }} className="px-6 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Top bar: back + sign out */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm font-semibold transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
                <path fillRule="evenodd" clipRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" />
              </svg>
              Back to Dashboard
            </Link>
            <SignOutButton signOutOptions={{ redirectUrl: '/sign-in' }}>
              <button
                className="rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
              >
                Sign Out
              </button>
            </SignOutButton>
          </div>

          {/* Name + status + ID */}
          <div className="flex flex-wrap items-start gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Student Profile
              </p>
              <h1
                className="text-2xl sm:text-3xl font-bold text-white leading-tight"
                style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
              >
                {student.firstName} {student.lastName}
              </h1>
              {studentId && (
                <p className="text-sm mt-1 tabular-nums" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Student ID: {studentId}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <span
                className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: `${STATUS_COLOUR[student.status] ?? '#888'}25`,
                  color: STATUS_COLOUR[student.status] ?? '#888',
                  border: `1px solid ${STATUS_COLOUR[student.status] ?? '#888'}`,
                }}
              >
                {student.status}
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: `${PAYMENT_COLOUR[student.paymentStatus ?? 'unpaid'] ?? '#dc2626'}25`,
                  color: PAYMENT_COLOUR[student.paymentStatus ?? 'unpaid'] ?? '#dc2626',
                  border: `1px solid ${PAYMENT_COLOUR[student.paymentStatus ?? 'unpaid'] ?? '#dc2626'}`,
                }}
              >
                {student.paymentStatus ?? 'unpaid'}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Actions:
            </span>
            <StudentActions studentId={student._id} currentStatus={student.status} />
            {moodleCourseUrl && (
              <a
                href={moodleCourseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-opacity duration-150 hover:opacity-80"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
              >
                Open in Moodle ↗
              </a>
            )}
          </div>

        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column (2/3) ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Contact Information */}
          <Card title="Contact Information">
            <FieldGrid>
              <Field label="First Name"       value={student.firstName} />
              <Field label="Last Name"        value={student.lastName} />
              <Field label="Email"            value={<a href={`mailto:${student.email}`} style={{ color: '#378ADD' }}>{student.email}</a>} wide />
              <Field label="Phone"            value={student.phone} />
              <Field label="Programme"        value={student.program?.title} />
              <Field label="Cohort"           value={student.cohort} />
              <Field label="Applied"          value={fmtDate(student.applicationDate)} />
              <Field label="Accepted"         value={fmtDate(student.acceptedDate)} />
              {student.clerkUserId && (
                <Field label="Clerk User ID"  value={<span className="font-mono text-xs">{student.clerkUserId}</span>} wide />
              )}
            </FieldGrid>
          </Card>

          {/* Application Details */}
          <Card title="Application Details">
            {parsedNotes.length > 0 ? (
              <FieldGrid>
                {parsedNotes.map(({ label, value }) => (
                  <Field key={label} label={label} value={value} wide={label === 'Experience'} />
                ))}
              </FieldGrid>
            ) : (
              <p className="text-sm" style={{ color: 'rgba(43,48,58,0.4)' }}>No application notes on record.</p>
            )}

            {transcriptAsset?._id && (
              <>
                <Divider />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(30,53,96,0.4)' }}>
                    High School Transcript
                  </p>
                  {isImageAsset(transcriptAsset._id) ? (
                    <div className="flex flex-col gap-3">
                      <img
                        src={buildTranscriptUrl(transcriptAsset._id)}
                        alt="High school transcript"
                        className="rounded-lg max-h-64 object-contain w-full"
                        style={{ border: '1px solid rgba(30,53,96,0.1)' }}
                      />
                      <a
                        href={buildTranscriptUrl(transcriptAsset._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold"
                        style={{ color: '#378ADD' }}
                      >
                        Open full size ↗
                      </a>
                    </div>
                  ) : (
                    <a
                      href={buildTranscriptUrl(transcriptAsset._id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 hover:border-[#378ADD]"
                      style={{ backgroundColor: '#F4F7F9', color: '#1E3560', border: '1.5px solid rgba(30,53,96,0.12)' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 shrink-0" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {transcriptAsset.originalFilename ?? 'Download Transcript (PDF)'}
                    </a>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Timeline */}
          {timeline.length > 0 && (
            <Card title="Activity Timeline">
              <ol className="relative ml-3 flex flex-col gap-0">
                {timeline.map((event, i) => (
                  <li key={event.label} className="relative pl-7 pb-6 last:pb-0">
                    {/* Vertical line */}
                    {i < timeline.length - 1 && (
                      <div
                        className="absolute left-[5px] top-5 bottom-0 w-px"
                        style={{ backgroundColor: 'rgba(30,53,96,0.1)' }}
                        aria-hidden
                      />
                    )}
                    {/* Dot */}
                    <div
                      className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: event.colour }}
                      aria-hidden
                    />
                    <p className="text-sm font-semibold leading-tight" style={{ color: '#1E3560' }}>
                      {event.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.45)' }}>
                      {event.date}
                    </p>
                  </li>
                ))}
              </ol>
            </Card>
          )}

        </div>

        {/* ── Right column (1/3) ── */}
        <div className="flex flex-col gap-6">

          {/* Moodle Progress */}
          {student.moodleUserId && moodleCourseId ? (
            <Card title="Course Progress">
              {progressStatuses ? (
                <>
                  {/* Progress bar */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: 'rgba(43,48,58,0.55)' }}>
                        {completedCount} of {totalCount} activities
                      </span>
                      <span className="text-lg font-bold tabular-nums" style={{ color: courseComplete ? '#22c55e' : '#1E3560' }}>
                        {progressPct}%
                      </span>
                    </div>
                    <div className="w-full rounded-full h-2.5" style={{ backgroundColor: 'rgba(30,53,96,0.08)' }}>
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%`, backgroundColor: courseComplete ? '#22c55e' : '#378ADD' }}
                      />
                    </div>
                    {courseComplete && (
                      <p className="text-xs font-semibold mt-2" style={{ color: '#22c55e' }}>
                        Course complete ✓
                      </p>
                    )}
                  </div>

                  {/* Activity list */}
                  {progressStatuses.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {progressStatuses.map((s: any) => {
                        const done = s.state === 1
                        const name = activityNames[s.cmid] ?? `Activity ${s.cmid}`
                        return (
                          <div key={s.cmid} className="flex items-center gap-2.5">
                            <div
                              className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: done ? '#22c55e' : 'rgba(30,53,96,0.1)' }}
                              aria-hidden
                            >
                              {done && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-2.5 h-2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </div>
                            <span className="text-xs leading-snug" style={{ color: done ? '#1E3560' : 'rgba(43,48,58,0.45)' }}>
                              {name}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Grades */}
                  {gradeItems && gradeItems.length > 0 && (
                    <>
                      <Divider />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(30,53,96,0.4)' }}>
                        Grades
                      </p>
                      <div className="flex flex-col gap-2">
                        {gradeItems
                          .filter((g: any) => g.itemname && g.gradeformatted && g.gradeformatted !== '-')
                          .map((g: any, i: number) => (
                            <div key={i} className="flex items-center justify-between gap-2">
                              <span className="text-xs leading-snug flex-1 min-w-0 truncate" style={{ color: 'rgba(43,48,58,0.65)' }}>
                                {g.itemname}
                              </span>
                              <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: '#1E3560' }}>
                                {g.gradeformatted}
                                {g.percentageformatted && g.percentageformatted !== '-' && (
                                  <span className="font-normal ml-1" style={{ color: 'rgba(43,48,58,0.4)' }}>
                                    ({g.percentageformatted})
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm" style={{ color: 'rgba(43,48,58,0.4)' }}>
                  No progress data available.
                </p>
              )}
            </Card>
          ) : (
            <Card title="Course Progress">
              <p className="text-sm" style={{ color: 'rgba(43,48,58,0.4)' }}>
                {student.moodleUserId
                  ? 'No Moodle course linked to this programme.'
                  : 'Student has not been provisioned in Moodle yet.'}
              </p>
            </Card>
          )}

          {/* Payment History */}
          <Card title="Payment History">
            {student.tuitionAmount && (
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'rgba(43,48,58,0.5)' }}>Tuition</span>
                <span className="text-base font-bold" style={{ color: '#1E3560' }}>
                  ${student.tuitionAmount.toLocaleString()} CAD
                </span>
              </div>
            )}

            {outstanding > 0 && (
              <div
                className="rounded-lg px-3 py-2.5 mb-4 flex items-center justify-between"
                style={{ backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}
              >
                <span className="text-xs font-semibold" style={{ color: '#dc2626' }}>Outstanding</span>
                <span className="text-sm font-bold" style={{ color: '#dc2626' }}>
                  ${outstanding.toLocaleString()} CAD
                </span>
              </div>
            )}

            {charges.length > 0 ? (
              <div className="flex flex-col gap-3">
                {charges.map((charge) => (
                  <div
                    key={charge.id}
                    className="rounded-lg p-3"
                    style={{ backgroundColor: '#F4F7F9', border: '1px solid rgba(30,53,96,0.06)' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-bold" style={{ color: '#1E3560' }}>
                        ${(charge.amount / 100).toFixed(2)} {charge.currency.toUpperCase()}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase shrink-0"
                        style={{
                          backgroundColor: charge.status === 'succeeded' ? 'rgba(34,197,94,0.12)' : 'rgba(220,38,38,0.1)',
                          color: charge.status === 'succeeded' ? '#22c55e' : '#dc2626',
                        }}
                      >
                        {charge.status}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(43,48,58,0.45)' }}>
                      {fmtUnix(charge.created)}
                    </p>
                    {charge.receipt_url && (
                      <a
                        href={charge.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold mt-1 inline-block"
                        style={{ color: '#378ADD' }}
                      >
                        View receipt ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'rgba(43,48,58,0.4)' }}>No payments on record.</p>
            )}
          </Card>

          {/* Documents */}
          <Card title="Documents">
            <div className="flex flex-col gap-3">
              {/* Transcript */}
              {transcriptAsset?._id ? (
                <a
                  href={buildTranscriptUrl(transcriptAsset._id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors duration-150 hover:border-[#378ADD]"
                  style={{ backgroundColor: '#F4F7F9', border: '1.5px solid rgba(30,53,96,0.1)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(55,138,221,0.1)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth={1.75} className="w-4 h-4" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold" style={{ color: '#1E3560' }}>High School Transcript</p>
                    <p className="text-[11px] truncate" style={{ color: 'rgba(43,48,58,0.45)' }}>
                      {transcriptAsset.originalFilename ?? 'transcript'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold shrink-0" style={{ color: '#378ADD' }}>↗</span>
                </a>
              ) : (
                <div
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ backgroundColor: '#F4F7F9', border: '1.5px solid rgba(30,53,96,0.07)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(30,53,96,0.06)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="rgba(30,53,96,0.3)" strokeWidth={1.75} className="w-4 h-4" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'rgba(30,53,96,0.4)' }}>High School Transcript</p>
                    <p className="text-[11px]" style={{ color: 'rgba(43,48,58,0.35)' }}>Not uploaded</p>
                  </div>
                </div>
              )}

              {/* Certificate */}
              <div
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ backgroundColor: '#F4F7F9', border: '1.5px solid rgba(30,53,96,0.07)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: courseComplete ? 'rgba(34,197,94,0.1)' : 'rgba(30,53,96,0.06)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke={courseComplete ? '#22c55e' : 'rgba(30,53,96,0.3)'} strokeWidth={1.75} className="w-4 h-4" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: courseComplete ? '#1E3560' : 'rgba(30,53,96,0.4)' }}>
                    Completion Certificate
                  </p>
                  <p className="text-[11px]" style={{ color: 'rgba(43,48,58,0.45)' }}>
                    {student.certificateId
                      ? `ID: ${student.certificateId}`
                      : courseComplete
                        ? 'Available in student portal'
                        : `${progressPct}% complete`}
                  </p>
                </div>
              </div>

              {/* Student ID */}
              {studentId && (
                <div
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ backgroundColor: '#F4F7F9', border: '1.5px solid rgba(30,53,96,0.07)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(55,138,221,0.1)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth={1.75} className="w-4 h-4" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#1E3560' }}>Student ID Card</p>
                    <p className="text-[11px] tabular-nums" style={{ color: 'rgba(43,48,58,0.45)' }}>
                      ID: {studentId} — available in student portal
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>
    </main>
  )
}
