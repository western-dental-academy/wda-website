import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@sanity/client'
import Link from 'next/link'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'aiden2@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
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
      applicationDate, acceptedDate, tuitionAmount,
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

  const statusColour: Record<string, string> = {
    pending: '#E67E22',
    accepted: '#378ADD',
    enrolled: '#22c55e',
    rejected: '#dc2626',
    withdrawn: '#888',
  }

  const paymentColour: Record<string, string> = {
    paid: '#22c55e',
    unpaid: '#dc2626',
    pending: '#E67E22',
  }

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
          <Link
            href="/studio/structure/students"
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
          >
            Open Sanity Studio
          </Link>
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

        {/* Student table */}
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
            <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>All Students</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F4F7F9' }}>
                  {['Name', 'Email', 'Programme', 'Applied', 'Status', 'Payment', 'Tuition'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(30,53,96,0.4)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student: any, i: number) => (
                  <tr
                    key={student._id}
                    style={{ borderTop: i > 0 ? '1px solid rgba(30,53,96,0.06)' : 'none' }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: '#1E3560' }}>
                        {student.firstName} {student.lastName}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: 'rgba(43,48,58,0.7)' }}>{student.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: 'rgba(43,48,58,0.7)' }}>
                        {student.program?.title ?? '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: 'rgba(43,48,58,0.7)' }}>
                        {student.applicationDate
                          ? new Date(student.applicationDate).toLocaleDateString('en-CA')
                          : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase"
                        style={{
                          backgroundColor: `${statusColour[student.status]}20`,
                          color: statusColour[student.status] ?? '#888',
                        }}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase"
                        style={{
                          backgroundColor: `${paymentColour[student.paymentStatus ?? 'unpaid']}20`,
                          color: paymentColour[student.paymentStatus ?? 'unpaid'],
                        }}
                      >
                        {student.paymentStatus ?? 'unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: '#1E3560' }}>
                        {student.tuitionAmount ? `$${student.tuitionAmount.toLocaleString()}` : '—'}
                      </p>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: 'rgba(43,48,58,0.4)' }}>
                      No students yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  )
}