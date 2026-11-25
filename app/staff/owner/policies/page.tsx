import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CountersignButton, RemindNowButton } from '@/components/staff/PolicyOwnerActions'
import {
  ACKS_QUERY,
  ACTIVE_STAFF_QUERY,
  appliesTo,
  fmtDate,
  getStaffByClerkId,
  latestAck,
  policyClient,
  statusFor,
  type AckLite,
  type PolicySummary,
  type StaffLite,
} from '@/lib/staff/policies'

export const metadata: Metadata = { title: 'Staff Policy Report', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function OwnerPoliciesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=%2Fstaff%2Fowner%2Fpolicies')
  const viewer = await getStaffByClerkId(userId)
  if (!viewer || viewer.role !== 'owner') redirect('/staff')

  // Owners see inactive (draft) policies too, so they can check who it will go to before switching it on
  const [policies, staff, acks] = await Promise.all([
    policyClient.fetch<Array<PolicySummary & { active?: boolean }>>(
      `*[_type == "policy" && !(_id in path("drafts.**"))] | order(active desc, title asc){
        _id, _rev, title, "slug": slug.current, version, effectiveDate, summary, category, requiresCountersign, notifiedVersion, active,
        "assignedIds": assignedTo[]._ref
      }`,
    ),
    policyClient.fetch<StaffLite[]>(ACTIVE_STAFF_QUERY),
    policyClient.fetch<AckLite[]>(ACKS_QUERY),
  ])

  const activePolicies = policies.filter(p => p.active)
  const peopleOutstanding = staff.filter(s =>
    activePolicies.some(p => appliesTo(p, s._id) && statusFor(p, latestAck(acks, p._id, s._id)) !== 'signed'),
  ).length

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>
      <div style={{ backgroundColor: '#0D3B6E' }} className="px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Western Dental Academy
            </p>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              Staff Policies
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {peopleOutstanding === 0
                ? 'Everyone is up to date.'
                : `${peopleOutstanding} staff member${peopleOutstanding === 1 ? ' has' : 's have'} something to sign. Reminders go out automatically every Monday.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RemindNowButton outstandingPeople={peopleOutstanding} />
            <Link
              href="/staff/owner"
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}
            >
              Hours &amp; Time Off
            </Link>
            <Link
              href="/studio"
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}
            >
              Edit in Studio
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {policies.length === 0 && (
          <div className="rounded-2xl px-6 py-10 text-center text-sm" style={{ backgroundColor: '#fff', color: 'rgba(43,48,58,0.6)' }}>
            No policies yet. Add one in Sanity Studio under Staff Policies → Policies.
          </div>
        )}

        {policies.map(p => {
          const assigned = staff.filter(s => appliesTo(p, s._id))
          const rows = assigned.map(s => {
            const ack = latestAck(acks, p._id, s._id)
            return { s, ack, status: statusFor(p, ack) }
          })
          const signed = rows.filter(r => r.status === 'signed').length
          const needCountersign = p.requiresCountersign ? rows.filter(r => r.status === 'signed' && !r.ack?.countersignedAt).length : 0
          const pct = assigned.length ? Math.round((signed / assigned.length) * 100) : 0

          return (
            <section key={p._id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(13,59,110,0.07)' }}>
              <div className="px-6 py-5 flex flex-wrap items-start justify-between gap-4" style={{ borderBottom: '1px solid #E6ECF1' }}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>
                      {p.title}
                    </h2>
                    {!p.active && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#eef0f3', color: '#5b6270' }}>
                        Inactive: staff can’t see it yet
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgba(43,48,58,0.55)' }}>
                    Version {p.version}
                    {p.active ? (p.notifiedVersion === p.version ? ' · Staff emailed' : ' · Email goes out at 9 AM') : ''}
                    {p.requiresCountersign ? ' · Needs management countersignature' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: signed === assigned.length && assigned.length ? '#16a34a' : '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>
                    {signed}/{assigned.length}
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>
                    signed{needCountersign ? ` · ${needCountersign} to countersign` : ''}
                  </p>
                  <div className="mt-2 h-1.5 w-32 rounded-full overflow-hidden ml-auto" style={{ backgroundColor: '#E6ECF1' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#16a34a' }} />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'rgba(43,48,58,0.5)' }}>
                      <th className="px-6 py-2.5 font-semibold">Staff member</th>
                      <th className="px-3 py-2.5 font-semibold">Status</th>
                      <th className="px-3 py-2.5 font-semibold">Answers</th>
                      {p.requiresCountersign && <th className="px-3 py-2.5 font-semibold">Countersignature</th>}
                      <th className="px-6 py-2.5 font-semibold text-right">Record</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ s, ack, status }) => (
                      <tr key={s._id} style={{ borderTop: '1px solid #EEF2F5' }}>
                        <td className="px-6 py-3 align-top">
                          <p className="font-semibold" style={{ color: '#0D3B6E' }}>{s.fullName}</p>
                          {s.jobTitle && <p className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>{s.jobTitle}</p>}
                        </td>
                        <td className="px-3 py-3 align-top whitespace-nowrap">
                          {status === 'signed' && ack ? (
                            <>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#16a34a1a', color: '#15803d' }}>Signed</span>
                              <p className="text-xs mt-1" style={{ color: 'rgba(43,48,58,0.55)' }}>{fmtDate(ack.acknowledgedAt, true)}</p>
                            </>
                          ) : status === 'outdated' && ack ? (
                            <>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E67E221a', color: '#b45309' }}>Signed old version</span>
                              <p className="text-xs mt-1" style={{ color: 'rgba(43,48,58,0.55)' }}>v{ack.policyVersion}, {fmtDate(ack.acknowledgedAt)}</p>
                            </>
                          ) : (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E67E221a', color: '#b45309' }}>Outstanding</span>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top text-xs" style={{ color: '#2B303A' }}>
                          {ack?.responses?.length
                            ? ack.responses.map((r, i) => (
                                <p key={i} className="mb-1">
                                  <span style={{ color: 'rgba(43,48,58,0.55)' }}>{r.question}: </span>
                                  <span className="font-semibold">{r.answer || '—'}</span>
                                </p>
                              ))
                            : <span style={{ color: 'rgba(43,48,58,0.35)' }}>—</span>}
                        </td>
                        {p.requiresCountersign && (
                          <td className="px-3 py-3 align-top text-xs">
                            {status === 'signed' && ack ? (
                              ack.countersignedAt ? (
                                <span style={{ color: '#2B303A' }}>
                                  {ack.countersignedBy}
                                  <br />
                                  <span style={{ color: 'rgba(43,48,58,0.55)' }}>{fmtDate(ack.countersignedAt)}</span>
                                </span>
                              ) : ack.staffId === viewer._id ? (
                                <span style={{ color: 'rgba(43,48,58,0.55)' }}>Another owner to countersign</span>
                              ) : (
                                <CountersignButton ackId={ack._id} />
                              )
                            ) : (
                              <span style={{ color: 'rgba(43,48,58,0.35)' }}>—</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-3 align-top text-right">
                          {ack ? (
                            <Link href={`/staff/policies/record/${ack._id}`} className="text-xs font-semibold" style={{ color: '#378ADD' }}>
                              View
                            </Link>
                          ) : (
                            <span style={{ color: 'rgba(43,48,58,0.35)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
