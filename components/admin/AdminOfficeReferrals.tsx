'use client'

import { useMemo, useState } from 'react'
import { suggestOffice } from '@/lib/offices/match'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DentalOfficeEntry {
  _id: string
  name: string
  city?: string
  email?: string
  website?: string
  visitedBy?: string
  visited?: boolean
}

export interface OfficeReferralEntry {
  _id: string
  kind: 'workshop' | 'course'
  firstName?: string
  lastName?: string
  email?: string
  item?: string
  registeredAt?: string
  officeId?: string
  officeOther?: string
  officeSource?: 'self-reported' | 'matched' | 'manual' | 'none'
  dentalBackground?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const CARD = { border: '1.5px solid rgba(30,53,96,0.09)' }

function formatDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Regina', month: 'short', day: 'numeric', year: 'numeric' })
}

function personKey(r: OfficeReferralEntry): string {
  return (r.email ?? r._id).trim().toLowerCase()
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminOfficeReferrals({
  offices,
  initialReferrals,
}: {
  offices: DentalOfficeEntry[]
  initialReferrals: OfficeReferralEntry[]
}) {
  const [referrals, setReferrals] = useState(initialReferrals)
  const [since, setSince] = useState('2026-09-01')
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [manualPick, setManualPick] = useState<Record<string, string>>({})

  const officeById = useMemo(() => new Map(offices.map(o => [o._id, o])), [offices])

  const inRange = useMemo(
    () => referrals.filter(r => !since || (r.registeredAt ?? '') >= since),
    [referrals, since],
  )

  // Leaderboard: unique registrants (by email) from visited offices, credited to the visitor
  const { staffRows, officeRows } = useMemo(() => {
    const staff = new Map<string, { people: Set<string>; offices: Set<string> }>()
    const perOffice = new Map<string, Set<string>>()
    for (const r of inRange) {
      if (!r.officeId) continue
      const office = officeById.get(r.officeId)
      if (!office) continue
      const people = perOffice.get(office._id) ?? new Set<string>()
      people.add(personKey(r))
      perOffice.set(office._id, people)
      if (office.visited && office.visitedBy) {
        const s = staff.get(office.visitedBy) ?? { people: new Set<string>(), offices: new Set<string>() }
        s.people.add(personKey(r))
        s.offices.add(office._id)
        staff.set(office.visitedBy, s)
      }
    }
    return {
      staffRows: Array.from(staff.entries())
        .map(([name, s]) => ({ name, count: s.people.size, offices: s.offices.size }))
        .sort((a, b) => b.count - a.count),
      officeRows: Array.from(perOffice.entries())
        .map(([id, people]) => ({ office: officeById.get(id)!, count: people.size }))
        .sort((a, b) => b.count - a.count),
    }
  }, [inRange, officeById])

  const toReview = useMemo(
    () => inRange
      .filter(r => !r.officeId && r.officeSource !== 'none')
      .map(r => ({ r, suggestion: suggestOffice(r, offices) }))
      .sort((a, b) => Number(!!b.suggestion) - Number(!!a.suggestion)),
    [inRange, offices],
  )

  const topCount = staffRows[0]?.count ?? 0

  async function assign(registrationId: string, officeId: string | null, source: 'matched' | 'manual' | 'none') {
    setSaving(registrationId)
    setError('')
    try {
      const res = await fetch('/api/admin/office-referrals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, officeId, source }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not save')
      setReferrals(prev => prev.map(r => r._id === registrationId
        ? { ...r, officeId: officeId ?? undefined, officeSource: source }
        : r))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header / filter ── */}
      <div className="rounded-2xl bg-white overflow-hidden" style={CARD}>
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Office Outreach Leaderboard</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.45)' }}>
              Paid workshop and course registrants from offices staff have visited. Each person counts once.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#1E3560' }}>
            Since
            <input
              type="date"
              value={since}
              onChange={e => setSince(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-xs"
              style={{ border: '1.5px solid rgba(30,53,96,0.15)' }}
            />
          </label>
        </div>

        <div className="p-6">
          {staffRows.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(43,48,58,0.55)' }}>No registrants from visited offices yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {staffRows.map((s, i) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold" style={{ color: '#1E3560' }}>
                      {i === 0 ? '🏆 ' : ''}{s.name}
                      <span className="ml-2 text-xs font-normal" style={{ color: 'rgba(43,48,58,0.5)' }}>
                        {s.offices} office{s.offices === 1 ? '' : 's'}
                      </span>
                    </span>
                    <span className="text-sm font-bold" style={{ color: '#378ADD' }}>
                      {s.count} registrant{s.count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: 'rgba(30,53,96,0.08)' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${topCount ? Math.round((s.count / topCount) * 100) : 0}%`, backgroundColor: i === 0 ? '#E67E22' : '#378ADD' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Needs review ── */}
      <div className="rounded-2xl bg-white overflow-hidden" style={CARD}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>
            Registrants Without an Office
            <span className="ml-2 text-xs font-semibold" style={{ color: '#E67E22' }}>{toReview.length}</span>
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.45)' }}>
            Confirm a suggested match, pick the office yourself, or mark them as not from a listed office.
          </p>
        </div>
        {error && <p className="px-6 pt-4 text-xs font-medium" style={{ color: '#dc2626' }} role="alert">{error}</p>}
        {toReview.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: 'rgba(43,48,58,0.55)' }}>Nothing to review.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'rgba(30,53,96,0.06)' }}>
            {toReview.map(({ r, suggestion }) => {
              const suggested = suggestion ? officeById.get(suggestion.officeId) : undefined
              const busy = saving === r._id
              return (
                <li key={r._id} className="px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#1E3560' }}>
                      {r.firstName} {r.lastName}
                      <span className="ml-2 text-xs font-normal" style={{ color: 'rgba(43,48,58,0.5)' }}>{r.email}</span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.55)' }}>
                      {r.item} · {formatDate(r.registeredAt)}
                      {r.officeOther && <> · typed &ldquo;{r.officeOther}&rdquo;</>}
                    </p>
                    {suggested && (
                      <p className="text-xs mt-1" style={{ color: '#378ADD' }}>
                        Suggested: <strong>{suggested.name}</strong>{suggested.city ? ` (${suggested.city})` : ''}. {suggestion!.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {suggested && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => assign(r._id, suggested._id, 'matched')}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                        style={{ backgroundColor: '#378ADD' }}
                      >
                        Confirm match
                      </button>
                    )}
                    <select
                      value={manualPick[r._id] ?? ''}
                      onChange={e => setManualPick(p => ({ ...p, [r._id]: e.target.value }))}
                      className="rounded-lg px-2 py-1.5 text-xs max-w-[14rem]"
                      style={{ border: '1.5px solid rgba(30,53,96,0.15)', color: '#1E3560' }}
                    >
                      <option value="">Pick an office…</option>
                      {offices.map(o => (
                        <option key={o._id} value={o._id}>{o.name}{o.city ? ` (${o.city})` : ''}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={busy || !manualPick[r._id]}
                      onClick={() => assign(r._id, manualPick[r._id], 'manual')}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                      style={{ backgroundColor: 'rgba(30,53,96,0.08)', color: '#1E3560' }}
                    >
                      Assign
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => assign(r._id, null, 'none')}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                      style={{ color: 'rgba(43,48,58,0.55)' }}
                    >
                      Not from a listed office
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* ── Per office ── */}
      <div className="rounded-2xl bg-white overflow-hidden" style={CARD}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Registrants by Office</h2>
        </div>
        {officeRows.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: 'rgba(43,48,58,0.55)' }}>No office registrants yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>
                  <th className="px-6 py-2 font-semibold">Office</th>
                  <th className="px-3 py-2 font-semibold">City</th>
                  <th className="px-3 py-2 font-semibold">Visited by</th>
                  <th className="px-6 py-2 font-semibold text-right">Registrants</th>
                </tr>
              </thead>
              <tbody>
                {officeRows.map(({ office, count }) => (
                  <tr key={office._id} className="border-t" style={{ borderColor: 'rgba(30,53,96,0.06)' }}>
                    <td className="px-6 py-2.5 font-semibold" style={{ color: '#1E3560' }}>{office.name}</td>
                    <td className="px-3 py-2.5" style={{ color: 'rgba(43,48,58,0.7)' }}>{office.city}</td>
                    <td className="px-3 py-2.5" style={{ color: 'rgba(43,48,58,0.7)' }}>
                      {office.visitedBy ?? '—'}
                      {office.visitedBy && !office.visited && (
                        <span className="ml-1 text-xs" style={{ color: '#E67E22' }}>(not marked visited)</span>
                      )}
                    </td>
                    <td className="px-6 py-2.5 text-right font-bold" style={{ color: '#378ADD' }}>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
