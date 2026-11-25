'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { PolicyReport } from '@/lib/staff/policies'

// WDA Hub → Policies tab: who has signed which policy version, declaration answers,
// management countersignatures and on-demand reminder emails.

function fmtDate(iso: string, withTime = false): string {
  return new Date(iso).toLocaleString('en-CA', {
    timeZone: 'America/Regina',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })
}

const muted = 'rgba(43,48,58,0.55)'
const faint = 'rgba(43,48,58,0.35)'

function Badge({ children, tone }: { children: React.ReactNode; tone: 'green' | 'amber' | 'grey' }) {
  const c = tone === 'green' ? ['#16a34a1a', '#15803d'] : tone === 'amber' ? ['#E67E221a', '#b45309'] : ['#eef0f3', '#5b6270']
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: c[0], color: c[1] }}>
      {children}
    </span>
  )
}

function CountersignButton({ ackId }: { ackId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!confirm('Record your management countersignature on this signed policy?')) return
          setBusy(true)
          setError(null)
          const res = await fetch('/api/staff/policies/countersign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ackId }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) setError(data.error ?? 'Could not countersign.')
          setBusy(false)
          router.refresh()
        }}
        className="text-xs font-bold px-2.5 py-1 rounded-lg text-white transition-colors hover:bg-[#1E3560] disabled:opacity-50"
        style={{ backgroundColor: '#378ADD' }}
      >
        {busy ? 'Saving…' : 'Countersign'}
      </button>
      {error && <span className="text-xs" style={{ color: '#b42318' }}>{error}</span>}
    </span>
  )
}

function RemindNowButton({ outstandingPeople }: { outstandingPeople: number }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      {msg && <span className="text-xs" style={{ color: muted }}>{msg}</span>}
      <button
        type="button"
        disabled={busy || outstandingPeople === 0}
        onClick={async () => {
          if (!confirm(`Email a reminder now to the ${outstandingPeople} staff member${outstandingPeople === 1 ? '' : 's'} with unsigned policies?`)) return
          setBusy(true)
          setMsg(null)
          const res = await fetch('/api/staff/policies/remind', { method: 'POST' })
          const data = await res.json().catch(() => ({}))
          setMsg(
            res.ok
              ? `Sent ${data.sent} email${data.sent === 1 ? '' : 's'}.${data.errors?.length ? ` ${data.errors.length} failed.` : ''}`
              : (data.error ?? 'Could not send.'),
          )
          setBusy(false)
        }}
        className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1E3560] disabled:opacity-40 disabled:hover:bg-[#378ADD]"
        style={{ backgroundColor: '#378ADD' }}
      >
        {busy ? 'Sending…' : 'Email reminders now'}
      </button>
    </span>
  )
}

export default function AdminPolicies({
  policies,
  peopleOutstanding,
  currentUserEmail,
}: {
  policies: PolicyReport[]
  peopleOutstanding: number
  currentUserEmail: string
}) {
  const activeCount = policies.filter(p => p.active).length

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <div
        className="rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4"
        style={{ backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(30,53,96,0.07)' }}
      >
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#1E3560', fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Staff Policies
          </h2>
          <p className="text-sm mt-0.5" style={{ color: muted }}>
            {activeCount === 0
              ? 'No policies are switched on yet, so staff can’t see any.'
              : peopleOutstanding === 0
                ? 'Everyone is up to date.'
                : `${peopleOutstanding} staff member${peopleOutstanding === 1 ? ' has' : 's have'} something to sign. Reminders go out automatically every Monday.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RemindNowButton outstandingPeople={peopleOutstanding} />
          <Link
            href="/studio"
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{ border: '1.5px solid #1E3560', color: '#1E3560' }}
          >
            Edit policies in Studio
          </Link>
        </div>
      </div>

      {policies.length === 0 && (
        <div className="rounded-2xl px-6 py-10 text-center text-sm" style={{ backgroundColor: '#fff', color: muted }}>
          No policies yet. Add one in Sanity Studio under Staff Policies → Policies.
        </div>
      )}

      {policies.map(p => {
        const signed = p.rows.filter(r => r.status === 'signed').length
        const total = p.rows.length
        const needCountersign = p.requiresCountersign ? p.rows.filter(r => r.status === 'signed' && !r.ack?.countersignedAt).length : 0
        const pct = total ? Math.round((signed / total) * 100) : 0

        return (
          <section key={p._id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(30,53,96,0.07)' }}>
            <div className="px-6 py-5 flex flex-wrap items-start justify-between gap-4" style={{ borderBottom: '1px solid #E6ECF1' }}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold" style={{ color: '#1E3560', fontFamily: 'var(--font-montserrat), sans-serif' }}>
                    {p.title}
                  </h3>
                  {!p.active && <Badge tone="grey">Switched off: staff can’t see it</Badge>}
                </div>
                <p className="text-xs mt-1" style={{ color: muted }}>
                  Version {p.version}
                  {p.active ? (p.emailed ? ' · Staff emailed' : ' · Email goes out at 9 AM') : ''}
                  {p.requiresCountersign ? ' · Needs management countersignature' : ''}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-2xl font-bold"
                  style={{ color: signed === total && total ? '#16a34a' : '#1E3560', fontFamily: 'var(--font-montserrat), sans-serif' }}
                >
                  {signed}/{total}
                </p>
                <p className="text-xs" style={{ color: muted }}>
                  signed{needCountersign ? ` · ${needCountersign} to countersign` : ''}
                </p>
                <div className="mt-2 h-1.5 w-32 rounded-full overflow-hidden ml-auto" style={{ backgroundColor: '#E6ECF1' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#16a34a' }} />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
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
                  {p.rows.map(({ staffId, staffName, staffEmail, jobTitle, ack, status }) => (
                    <tr key={staffId} style={{ borderTop: '1px solid #EEF2F5' }}>
                      <td className="px-6 py-3 align-top">
                        <p className="font-semibold" style={{ color: '#1E3560' }}>{staffName}</p>
                        {jobTitle && <p className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>{jobTitle}</p>}
                      </td>
                      <td className="px-3 py-3 align-top">
                        {status === 'signed' && ack ? (
                          <>
                            <Badge tone="green">Signed</Badge>
                            <p className="text-xs mt-1" style={{ color: muted }}>{fmtDate(ack.acknowledgedAt, true)}</p>
                          </>
                        ) : status === 'outdated' && ack ? (
                          <>
                            <Badge tone="amber">Signed old version</Badge>
                            <p className="text-xs mt-1" style={{ color: muted }}>v{ack.policyVersion}, {fmtDate(ack.acknowledgedAt)}</p>
                          </>
                        ) : (
                          <Badge tone="amber">Outstanding</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3 align-top text-xs" style={{ color: '#2B303A' }}>
                        {ack?.responses?.length
                          ? ack.responses.map((r, i) => (
                              <p key={i} className="mb-1">
                                <span style={{ color: muted }}>{r.question}: </span>
                                <span className="font-semibold">{r.answer || '—'}</span>
                              </p>
                            ))
                          : <span style={{ color: faint }}>—</span>}
                      </td>
                      {p.requiresCountersign && (
                        <td className="px-3 py-3 align-top text-xs">
                          {status === 'signed' && ack ? (
                            ack.countersignedAt ? (
                              <span style={{ color: '#2B303A' }}>
                                {ack.countersignedBy}
                                <br />
                                <span style={{ color: muted }}>{fmtDate(ack.countersignedAt)}</span>
                              </span>
                            ) : staffEmail?.toLowerCase() === currentUserEmail.toLowerCase() ? (
                              <span style={{ color: muted }}>Another manager to countersign</span>
                            ) : (
                              <CountersignButton ackId={ack._id} />
                            )
                          ) : (
                            <span style={{ color: faint }}>—</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-3 align-top text-right">
                        {ack ? (
                          <Link href={`/staff/policies/record/${ack._id}`} className="text-xs font-semibold" style={{ color: '#378ADD' }}>
                            View
                          </Link>
                        ) : (
                          <span style={{ color: faint }}>—</span>
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
  )
}
