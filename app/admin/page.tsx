import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@sanity/client'
import Link from 'next/link'
import AdminStudentTable from '@/components/AdminStudentTable'
import { stripe } from '@/lib/stripe/client'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

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

  const students = await client.fetch(
    `*[_type == "student"] | order(applicationDate desc) {
      _id, firstName, lastName, email, status, paymentStatus,
      applicationDate, acceptedDate, tuitionAmount, cohort, notes,
      program->{ title }
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

  // ── Revenue metrics ────────────────────────────────────────────────────────

  let succeededCharges: { amount: number; created: number }[] = []
  try {
    const charges = await stripe.charges.list({ limit: 100 })
    succeededCharges = charges.data
      .filter((c) => c.status === 'succeeded')
      .map((c) => ({ amount: c.amount, created: c.created }))
  } catch (err) {
    console.error('Stripe revenue fetch error:', err)
  }

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).getTime() / 1000

  const totalRevenue    = succeededCharges.reduce((sum, c) => sum + c.amount, 0) / 100
  const thisMonthRevenue = succeededCharges
    .filter((c) => c.created >= startOfMonth)
    .reduce((sum, c) => sum + c.amount, 0) / 100
  const outstandingBalance = students
    .filter((s: any) =>
      (s.status === 'accepted' || s.status === 'enrolled') &&
      s.paymentStatus !== 'paid' &&
      s.tuitionAmount
    )
    .reduce((sum: number, s: any) => sum + (s.tuitionAmount as number), 0)

  const formatCAD = (dollars: number) =>
    '$' + dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1E3560' }} className="px-6 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Admin Dashboard
            </p>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              Student Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="http://localhost:8080"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
            >
              Go to Moodle ↗
            </a>
            <Link
              href="/studio/structure/students"
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
            >
              Open Sanity Studio
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Total Applications', value: stats.total, colour: '#1E3560' },
            { label: 'Pending Review', value: stats.pending, colour: '#E67E22' },
            { label: 'Accepted', value: stats.accepted, colour: '#378ADD' },
            { label: 'Enrolled', value: stats.enrolled, colour: '#22c55e' },
            { label: 'Payments Received', value: stats.paid, colour: '#16a34a' },
          ].map(({ label, value, colour }) => (
            <div key={label} className="rounded-xl p-5 bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
              <p className="text-3xl font-bold mb-1" style={{ color: colour }}>{value}</p>
              <p className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Revenue */}
        <div className="mb-10">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: 'rgba(30,53,96,0.4)' }}
          >
            Revenue
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue Collected', value: formatCAD(totalRevenue),     colour: '#1E3560' },
              { label: "This Month's Revenue",    value: formatCAD(thisMonthRevenue), colour: '#378ADD' },
              { label: 'Outstanding Balance',     value: formatCAD(outstandingBalance), colour: '#E67E22' },
              { label: 'Paid Students',           value: String(stats.paid),          colour: '#22c55e' },
            ].map(({ label, value, colour }) => (
              <div key={label} className="rounded-xl p-5 bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
                <p className="text-3xl font-bold mb-1" style={{ color: colour }}>{value}</p>
                <p className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Sources */}
{referralData.length > 0 && (
  <div className="rounded-2xl bg-white overflow-hidden mb-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
    <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
      <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Referral Sources</h2>
    </div>
    <div className="p-6 flex flex-col gap-3">
      {referralData.map(([source, count]) => {
        const pct = Math.round((count / students.length) * 100)
        return (
          <div key={source}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm" style={{ color: '#1E3560' }}>{source}</span>
              <span className="text-sm font-bold" style={{ color: '#378ADD' }}>{count} ({pct}%)</span>
            </div>
            <div className="w-full rounded-full h-2" style={{ backgroundColor: 'rgba(30,53,96,0.08)' }}>
              <div
                className="h-2 rounded-full"
                style={{ width: `${pct}%`, backgroundColor: '#378ADD' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  </div>
)}

        {/* Student table */}
        <AdminStudentTable students={students} />

      </div>
    </main>
  )
}