'use client'

import { useState } from 'react'
import {
  TUTORING_HOURLY_RATE,
  TUTORING_STATUS_LABELS,
  formatLabel,
  type TutoringStatus,
} from '@/lib/tutoring/shared'

export interface TutoringInquiryEntry {
  _id: string
  service: 'tutoring' | 'coaching'
  firstName: string
  lastName: string
  email: string
  phone?: string
  school?: string
  stage?: string
  areas?: string[]
  details?: string
  format?: string
  availability?: string
  submittedAt?: string
  status?: TutoringStatus
  assignedTo?: string
  staffNotes?: string
  hours?: number
  amount?: number
  sessionDetails?: string
  paymentRequestedAt?: string
  paidAt?: string
}

const STATUS_STYLE: Record<TutoringStatus, { bg: string; color: string }> = {
  new: { bg: 'rgba(230,126,34,0.12)', color: '#c2660f' },
  contacted: { bg: 'rgba(55,138,221,0.12)', color: '#378ADD' },
  'payment-requested': { bg: 'rgba(30,53,96,0.1)', color: '#1E3560' },
  paid: { bg: 'rgba(22,163,74,0.1)', color: '#16a34a' },
  closed: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
}

const FILTERS: { id: 'open' | 'paid' | 'closed' | 'all'; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'paid', label: 'Paid' },
  { id: 'closed', label: 'Closed' },
  { id: 'all', label: 'All' },
]

function fmtDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Regina' })
}

async function post(body: Record<string, unknown>) {
  const res = await fetch('/api/admin/tutoring', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
  return data
}

function InquiryCard({ entry, onChange }: { entry: TutoringInquiryEntry; onChange: (e: TutoringInquiryEntry) => void }) {
  const status = entry.status ?? 'new'
  const [open, setOpen] = useState(status === 'new')
  const [assignedTo, setAssignedTo] = useState(entry.assignedTo ?? '')
  const [notes, setNotes] = useState(entry.staffNotes ?? '')
  const [hours, setHours] = useState(entry.hours ? String(entry.hours) : '1')
  const [sessionDetails, setSessionDetails] = useState(entry.sessionDetails ?? '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const hoursNum = Number(hours)
  const total = Number.isFinite(hoursNum) ? hoursNum * TUTORING_HOURLY_RATE : 0

  async function run(body: Record<string, unknown>, success: (d: any) => string) {
    setBusy(true)
    setMsg(null)
    try {
      const data = await post({ id: entry._id, ...body })
      onChange({ ...entry, ...data.inquiry })
      setMsg({ ok: true, text: success(data) })
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Something went wrong.' })
    } finally {
      setBusy(false)
    }
  }

  const s = STATUS_STYLE[status]
  return (
    <div className="rounded-xl bg-white" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex flex-wrap items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-[#1E3560]">{entry.firstName} {entry.lastName}</span>
        <span className="text-xs font-semibold rounded-full px-2.5 py-0.5" style={{ backgroundColor: 'rgba(74,159,212,0.1)', color: '#378ADD' }}>
          {entry.service === 'coaching' ? 'Coaching' : 'Tutoring'}
        </span>
        <span className="text-xs font-semibold rounded-full px-2.5 py-0.5" style={{ backgroundColor: s.bg, color: s.color }}>
          {TUTORING_STATUS_LABELS[status]}
        </span>
        <span className="text-xs text-[#2B303A]/50 ml-auto">{fmtDate(entry.submittedAt)}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 grid lg:grid-cols-2 gap-6 border-t" style={{ borderColor: 'rgba(30,53,96,0.07)' }}>
          <dl className="pt-4 text-sm space-y-2">
            {[
              ['Email', <a key="e" href={`mailto:${entry.email}`} className="text-[#378ADD] break-all">{entry.email}</a>],
              ['Phone', entry.phone ?? '—'],
              ['School', entry.school ?? '—'],
              ['Stage', entry.stage ?? '—'],
              ['Help with', (entry.areas ?? []).join(', ') || '—'],
              ['Format', formatLabel(entry.format)],
              ['Availability', entry.availability ?? '—'],
              ['In their words', entry.details ?? '—'],
            ].map(([k, v]) => (
              <div key={String(k)} className="grid grid-cols-[110px_1fr] gap-2">
                <dt className="text-[#2B303A]/50">{k}</dt>
                <dd className="text-[#1E3560] whitespace-pre-wrap">{v}</dd>
              </div>
            ))}
            {entry.paidAt && (
              <div className="grid grid-cols-[110px_1fr] gap-2">
                <dt className="text-[#2B303A]/50">Paid</dt>
                <dd className="text-[#16a34a] font-semibold">${(entry.amount ?? 0).toFixed(2)} on {fmtDate(entry.paidAt)}</dd>
              </div>
            )}
          </dl>

          <div className="pt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-[#1E3560]">
                Tutor / coach
                <input className="wda-input mt-1" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="e.g. Collette" />
              </label>
              <label className="text-xs font-semibold text-[#1E3560]">
                Status
                <select
                  className="wda-input mt-1"
                  value={status}
                  disabled={busy}
                  onChange={e => run({ action: 'update', status: e.target.value }, () => 'Status updated.')}
                >
                  {(Object.keys(TUTORING_STATUS_LABELS) as TutoringStatus[]).map(k => (
                    <option key={k} value={k}>{TUTORING_STATUS_LABELS[k]}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-xs font-semibold text-[#1E3560]">
              Staff notes
              <textarea className="wda-input mt-1 resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => run({ action: 'update', assignedTo, staffNotes: notes }, () => 'Saved.')}
              className="rounded-lg px-4 py-2 text-xs font-bold border-[1.5px] border-[#1E3560] text-[#1E3560] hover:bg-[#1E3560] hover:text-white transition-colors"
            >
              Save notes
            </button>

            {status !== 'paid' && status !== 'closed' && (
              <div className="rounded-xl p-4" style={{ backgroundColor: '#F4F7F9' }}>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4A9FD4] mb-3">Send payment request</p>
                <div className="grid grid-cols-[100px_1fr] gap-3 mb-3">
                  <label className="text-xs font-semibold text-[#1E3560]">
                    Hours
                    <input type="number" min={0.5} max={20} step={0.5} className="wda-input mt-1" value={hours} onChange={e => setHours(e.target.value)} />
                  </label>
                  <label className="text-xs font-semibold text-[#1E3560]">
                    Session details (shown to them)
                    <textarea
                      className="wda-input mt-1 resize-none"
                      rows={2}
                      value={sessionDetails}
                      onChange={e => setSessionDetails(e.target.value)}
                      placeholder="e.g. Tue Dec 9, 6–7 PM, online (Teams link to follow)"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={busy || !sessionDetails.trim() || !(hoursNum > 0)}
                    onClick={() => {
                      if (!confirm(`Email ${entry.email} a payment link for $${total.toFixed(2)}?`)) return
                      run(
                        { action: 'request-payment', hours: hoursNum, sessionDetails, assignedTo },
                        d => d.emailed ? `Payment link emailed to ${entry.email}.` : `Saved, but the email failed. Send them this link: ${d.payUrl}`,
                      )
                    }}
                    className="rounded-lg px-4 py-2 text-xs font-bold text-white bg-[#4A9FD4] hover:bg-[#1E3560] disabled:opacity-50 transition-colors"
                  >
                    {status === 'payment-requested' ? 'Resend' : 'Send'} payment link · ${total.toFixed(2)}
                  </button>
                  {entry.paymentRequestedAt && (
                    <span className="text-xs text-[#2B303A]/50">Last sent {fmtDate(entry.paymentRequestedAt)}</span>
                  )}
                </div>
                <p className="text-[11px] text-[#2B303A]/50 mt-2">
                  ${TUTORING_HOURLY_RATE}/hour. Resending replaces the earlier link. Paid in person instead? Set the status to Paid.
                </p>
              </div>
            )}

            {msg && (
              <p className="text-xs font-medium break-all" style={{ color: msg.ok ? '#16a34a' : 'rgb(185,28,28)' }} role="status">
                {msg.text}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminTutoring({ initialEntries }: { initialEntries: TutoringInquiryEntry[] }) {
  const [entries, setEntries] = useState(initialEntries)
  const [filter, setFilter] = useState<'open' | 'paid' | 'closed' | 'all'>('open')

  const shown = entries.filter(e => {
    const s = e.status ?? 'new'
    if (filter === 'all') return true
    if (filter === 'open') return s !== 'paid' && s !== 'closed'
    return s === filter
  })
  const count = (id: typeof filter) =>
    id === 'all' ? entries.length : entries.filter(e => {
      const s = e.status ?? 'new'
      return id === 'open' ? s !== 'paid' && s !== 'closed' : s === id
    }).length

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1E3560]" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Tutoring &amp; Coaching Inquiries
          </h2>
          <p className="text-sm text-[#2B303A]/60 mt-1">
            Review each request, match a tutor, agree a time, then send the payment link.
          </p>
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="rounded-lg px-3.5 py-2 text-xs font-bold"
              style={{
                backgroundColor: filter === f.id ? '#1E3560' : 'rgba(30,53,96,0.06)',
                color: filter === f.id ? '#fff' : 'rgba(30,53,96,0.6)',
              }}
            >
              {f.label} ({count(f.id)})
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-[#2B303A]/50 rounded-xl p-8 text-center" style={{ backgroundColor: '#F4F7F9' }}>
          No inquiries here yet.
        </p>
      ) : (
        <div className="space-y-3">
          {shown.map(e => (
            <InquiryCard
              key={e._id}
              entry={e}
              onChange={updated => setEntries(prev => prev.map(p => (p._id === updated._id ? updated : p)))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
