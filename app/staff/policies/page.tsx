import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { fmtDate, getPoliciesForStaff, getStaffByClerkId } from '@/lib/staff/policies'

export const metadata: Metadata = { title: 'Staff Policies', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function StaffPoliciesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=%2Fstaff%2Fpolicies')
  const staff = await getStaffByClerkId(userId)
  if (!staff) redirect('/')

  const rows = await getPoliciesForStaff(staff._id)
  const order = { outstanding: 0, outdated: 1, signed: 2 } as const
  rows.sort((a, b) => order[a.status] - order[b.status] || a.policy.title.localeCompare(b.policy.title))
  const outstanding = rows.filter(r => r.status !== 'signed').length

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>
      <div style={{ backgroundColor: '#0D3B6E' }} className="px-5 pt-10 pb-8">
        <div className="max-w-2xl mx-auto flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Western Dental Academy
            </p>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              Staff Policies
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {outstanding === 0
                ? 'You’re all caught up.'
                : `${outstanding} ${outstanding === 1 ? 'policy needs' : 'policies need'} your signature.`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 pt-1">
            <Link
              href="/staff"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              ← My Clock
            </Link>
            {staff.role === 'owner' && (
              <Link
                href="/staff/owner/policies"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
              >
                Team Report →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {rows.length === 0 && (
          <div className="rounded-2xl px-5 py-8 text-center" style={{ backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(13,59,110,0.07)' }}>
            <p className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>There are no policies for you to sign right now.</p>
          </div>
        )}
        {rows.map(({ policy, ack, status }) => {
          const badge =
            status === 'signed'
              ? { label: 'Signed', colour: '#16a34a' }
              : status === 'outdated'
                ? { label: 'Updated, sign again', colour: '#b45309' }
                : { label: 'Needs signature', colour: '#b45309' }
          return (
            <Link
              key={policy._id}
              href={`/staff/policies/${policy.slug}`}
              className="block rounded-2xl px-5 py-4 transition-shadow hover:shadow-md"
              style={{
                backgroundColor: '#fff',
                boxShadow: '0 1px 4px rgba(13,59,110,0.07)',
                borderLeft: status === 'signed' ? '4px solid transparent' : '4px solid #E67E22',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>
                    {policy.title}
                  </p>
                  {policy.summary && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(43,48,58,0.65)' }}>{policy.summary}</p>
                  )}
                  <p className="text-xs mt-2" style={{ color: 'rgba(43,48,58,0.45)' }}>
                    Version {policy.version}
                    {status === 'signed' && ack ? ` · Signed ${fmtDate(ack.acknowledgedAt)}` : ''}
                    {status === 'outdated' && ack ? ` · You signed version ${ack.policyVersion}` : ''}
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{ backgroundColor: `${badge.colour}1a`, color: badge.colour }}
                >
                  {badge.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
