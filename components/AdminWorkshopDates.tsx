'use client'

import { useState, useEffect } from 'react'
import type { WorkshopRegistration, WorkshopWaitlistEntry } from './AdminWorkshopRegistrations'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WorkshopOffering {
  _id: string
  title: string
  category: string
  capacity: number
  hasVirtualOption?: boolean
  virtualPrice?: number
  price?: number
}

export interface WorkshopDateItem {
  _id: string
  date: string
  active: boolean
  offering: WorkshopOffering | null
  teamsLink?: string
  virtualRegistrantCount?: number
}

interface Props {
  initialDates: WorkshopDateItem[]
  registrations: WorkshopRegistration[]
  waitlist: WorkshopWaitlistEntry[]
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORY_COLOUR: Record<string, string> = {
  'workshop':      '#16a34a',
  'course':        '#378ADD',
  'guest-speaker': '#8b5cf6',
}

const CATEGORY_LABEL: Record<string, string> = {
  'workshop':      'Workshop',
  'course':        'Course',
  'guest-speaker': 'Guest Speaker',
}

const BLANK_ADD = { offeringId: '', date: '', active: false }

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-CA', {
    timeZone: 'America/Edmonton', hour: 'numeric', minute: '2-digit',
  })
}

function isPast(iso: string): boolean {
  return new Date(iso).getTime() < Date.now()
}

// Convert UTC ISO from Sanity to datetime-local value displayed in Mountain Time
function utcToMountainLocal(isoUTC: string): string {
  const d = new Date(isoUTC)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Edmonton',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00'
  const h = get('hour') === '24' ? '00' : get('hour')
  return `${get('year')}-${get('month')}-${get('day')}T${h}:${get('minute')}`
}

// Convert datetime-local Mountain Time value to UTC ISO string for Sanity
function mountainLocalToUTC(localDT: string): string {
  const month = parseInt(localDT.slice(5, 7), 10)
  const day   = parseInt(localDT.slice(8, 10), 10)
  const isMDT = (month > 3 && month < 11) || (month === 3 && day >= 8)
  const offset = isMDT ? '-06:00' : '-07:00'
  return `${localDT}:00.000${offset}`
}

function registeredCount(dateId: string, regs: WorkshopRegistration[]): number {
  return regs.filter(r => r.workshopDateId === dateId).length
}

function waitlistCount(dateId: string, wl: WorkshopWaitlistEntry[]): number {
  return wl.filter(e => e.workshopDateId === dateId).length
}

function borderColor(date: WorkshopDateItem, regCount: number): string {
  const cap = date.offering?.capacity ?? 0
  if (!date.active || isPast(date.date)) return '3px solid rgba(43,48,58,0.12)'
  if (cap > 0 && regCount >= cap)         return '3px solid #E67E22'
  return '3px solid #22c55e'
}

// Shared input / label styles
const inputCls = 'w-full rounded-lg px-3 py-2 text-sm border bg-white outline-none focus:ring-2 focus:ring-[#378ADD]/20'
const inputStyle = { borderColor: 'rgba(30,53,96,0.15)', color: '#1E3560' }
const labelCls = 'block text-[11px] font-bold uppercase tracking-wide mb-1'
const labelStyle = { color: 'rgba(30,53,96,0.5)' }

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminWorkshopDates({ initialDates, registrations, waitlist }: Props) {
  const [dates,      setDates]      = useState<WorkshopDateItem[]>(initialDates)
  const [offerings,  setOfferings]  = useState<WorkshopOffering[]>([])
  const [offeringsLoading, setOfferingsLoading] = useState(true)

  const [showAdd,    setShowAdd]    = useState(false)
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [busyIds,    setBusyIds]    = useState<Set<string>>(new Set())
  const [qrModalId,  setQrModalId]  = useState<string | null>(null)
  const [copied,     setCopied]     = useState(false)

  // Teams link modal state
  const [teamsModal,   setTeamsModal]   = useState<{
    dateId: string; workshopName: string; dateStr: string; count: number
  } | null>(null)
  const [teamsSending, setTeamsSending] = useState(false)
  const [teamsSuccess, setTeamsSuccess] = useState<number | null>(null)
  const [teamsError,   setTeamsError]   = useState('')

  const [addForm,    setAddForm]    = useState(BLANK_ADD)
  const [addBusy,    setAddBusy]    = useState(false)
  const [addError,   setAddError]   = useState('')

  const [editForm,   setEditForm]   = useState({ date: '', active: true })
  const [editBusy,   setEditBusy]   = useState(false)
  const [editError,  setEditError]  = useState('')

  // Fetch workshop offerings for the Add Date dropdown
  useEffect(() => {
    fetch('/api/admin/workshop-offerings')
      .then(r => r.json())
      .then((data: WorkshopOffering[]) => setOfferings(Array.isArray(data) ? data : []))
      .catch(() => setOfferings([]))
      .finally(() => setOfferingsLoading(false))
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function setBusy(id: string, on: boolean) {
    setBusyIds(prev => { const n = new Set(prev); on ? n.add(id) : n.delete(id); return n })
  }

  function startEdit(d: WorkshopDateItem) {
    setEditingId(d._id)
    setEditForm({
      date:   utcToMountainLocal(d.date),
      active: d.active,
    })
    setEditError('')
    setShowAdd(false)
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function createDate(e: React.FormEvent) {
    e.preventDefault()
    if (!addForm.offeringId) { setAddError('Please select a workshop offering.'); return }
    if (!addForm.date)        { setAddError('Please select a date and time.'); return }
    setAddBusy(true); setAddError('')

    try {
      const res = await fetch('/api/admin/workshop-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeringId: addForm.offeringId,
          date:       mountainLocalToUTC(addForm.date),
          active:     addForm.active,
        }),
      })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? 'Error') }
      const created: WorkshopDateItem = await res.json()
      setDates(prev => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)))
      setAddForm(BLANK_ADD)
      setShowAdd(false)
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Failed to create date.')
    } finally {
      setAddBusy(false)
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    if (!editForm.date) { setEditError('Please select a date and time.'); return }
    setEditBusy(true); setEditError('')

    try {
      const res = await fetch(`/api/admin/workshop-dates/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date:   mountainLocalToUTC(editForm.date),
          active: editForm.active,
        }),
      })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? 'Error') }

      const id = editingId
      setDates(prev =>
        prev
          .map(d => d._id === id ? {
            ...d,
            date:   mountainLocalToUTC(editForm.date),
            active: editForm.active,
          } : d)
          .sort((a, b) => a.date.localeCompare(b.date))
      )
      setEditingId(null)
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setEditBusy(false)
    }
  }

  async function deleteDate(id: string) {
    if (!confirm('Delete this workshop date permanently? This cannot be undone.')) return
    setBusy(id, true)
    try {
      const res = await fetch(`/api/admin/workshop-dates/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setDates(prev => prev.filter(d => d._id !== id))
    } catch {
      alert('Failed to delete date. Please try again.')
    } finally {
      setBusy(id, false)
    }
  }

  async function sendTeamsLink(dateId: string) {
    setTeamsSending(true)
    setTeamsError('')
    setTeamsSuccess(null)
    try {
      const res = await fetch('/api/admin/send-teams-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopDateId: dateId }),
      })
      const data = await res.json() as { sent?: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to send Teams link')
      setTeamsSuccess(data.sent ?? 0)
    } catch (err: unknown) {
      setTeamsError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setTeamsSending(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-2xl bg-white overflow-hidden mb-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>

      {/* ── Header ── */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between gap-4"
        style={{ borderColor: 'rgba(30,53,96,0.08)' }}
      >
        <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>PD Schedule</h2>
        <button
          onClick={() => { setShowAdd(v => !v); setEditingId(null); setAddError('') }}
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:bg-[#2563EB]"
          style={{ backgroundColor: '#378ADD' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden>
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          Add Date
        </button>
      </div>

      {/* ── Add form ── */}
      {showAdd && (
        <div
          className="px-4 sm:px-6 py-4 sm:py-5 border-b"
          style={{ borderColor: 'rgba(30,53,96,0.08)', backgroundColor: '#F4F7F9' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(30,53,96,0.45)' }}>
            New Date
          </p>
          <form onSubmit={createDate} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Offering select */}
              <div className="sm:col-span-2">
                <label className={labelCls} style={labelStyle}>Workshop Offering</label>
                {offeringsLoading ? (
                  <p className="text-xs py-2" style={{ color: 'rgba(43,48,58,0.45)' }}>Loading offerings…</p>
                ) : offerings.length === 0 ? (
                  <p className="text-xs py-2" style={{ color: '#dc2626' }}>
                    No offerings found. Create one in Sanity Studio first (Professional Development → Workshops/Courses/Guest Speakers).
                  </p>
                ) : (
                  <select
                    value={addForm.offeringId}
                    onChange={e => setAddForm(f => ({ ...f, offeringId: e.target.value }))}
                    className={inputCls + ' cursor-pointer'}
                    style={inputStyle}
                  >
                    <option value="">Select an offering…</option>
                    {offerings.map(o => (
                      <option key={o._id} value={o._id}>
                        {o.title} ({CATEGORY_LABEL[o.category] ?? o.category})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date + time */}
              <div>
                <label className={labelCls} style={labelStyle}>
                  Date &amp; Time <span className="normal-case font-normal">(Mountain Time)</span>
                </label>
                <input
                  type="datetime-local"
                  value={addForm.date}
                  onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))}
                  className={inputCls + ' cursor-pointer'}
                  style={inputStyle}
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={addForm.active}
                    onClick={() => setAddForm(f => ({ ...f, active: !f.active }))}
                    className="relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 shrink-0"
                    style={{ backgroundColor: addForm.active ? '#22c55e' : 'rgba(43,48,58,0.2)' }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                      style={{ transform: addForm.active ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </button>
                  <span className="text-sm font-medium" style={{ color: '#1E3560' }}>
                    {addForm.active ? 'Active (visible in registration form)' : 'Inactive (hidden)'}
                  </span>
                </label>
              </div>
            </div>

            {addError && <p className="text-xs mt-3" style={{ color: '#dc2626' }}>{addError}</p>}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="submit"
                disabled={addBusy}
                className="rounded-lg px-5 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors duration-150 hover:bg-[#15294a]"
                style={{ backgroundColor: '#1E3560' }}
              >
                {addBusy ? 'Saving…' : 'Create Date'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setAddError(''); setAddForm(BLANK_ADD) }}
                className="rounded-lg px-5 py-2 text-xs font-semibold transition-colors duration-150 hover:bg-[#e0e8f0]"
                style={{ color: 'rgba(30,53,96,0.55)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── QR Modal ── */}
      {qrModalId && (() => {
        const qrDate   = dates.find(d => d._id === qrModalId)
        const qrUrl    = `https://westerndentalacademy.com/feedback/workshop/${qrModalId}`
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrUrl)}&color=0D3B6E&bgcolor=ffffff`
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setQrModalId(null)}
          >
            <div
              className="bg-white rounded-2xl p-7 max-w-xs w-full text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#E67E22' }}>Feedback QR</p>
                  <p className="text-sm font-bold mt-0.5 leading-tight" style={{ color: '#1E3560' }}>
                    {qrDate?.offering?.title ?? 'Workshop'}
                  </p>
                </div>
                <button
                  onClick={() => setQrModalId(null)}
                  className="rounded-full p-1 transition-colors hover:bg-gray-100"
                  style={{ color: 'rgba(43,48,58,0.4)' }}
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* QR image */}
              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImgUrl}
                  alt="Feedback QR code"
                  width={220}
                  height={220}
                  className="rounded-xl"
                  style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}
                />
              </div>

              {/* URL */}
              <p className="text-[10px] break-all mb-5" style={{ color: 'rgba(43,48,58,0.45)' }}>
                {qrUrl}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const win = window.open('', '_blank')
                    if (!win) return
                    win.document.write(`<!DOCTYPE html><html><head><title>WDA Feedback QR</title><style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#fff}img{width:280px;height:280px}p{font-size:12px;color:#555;margin-top:12px}</style></head><body><img src="${qrImgUrl}" /><p>${qrUrl}</p></body></html>`)
                    win.document.close()
                    win.print()
                  }}
                  className="flex-1 rounded-lg py-2 text-xs font-bold transition-colors duration-150 hover:bg-[#15294a] text-white"
                  style={{ backgroundColor: '#0D3B6E' }}
                >
                  Print
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(qrUrl).then(() => {
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    })
                  }}
                  className="flex-1 rounded-lg py-2 text-xs font-bold border transition-colors duration-150"
                  style={{
                    borderColor: copied ? '#22c55e' : 'rgba(30,53,96,0.15)',
                    color: copied ? '#16a34a' : 'rgba(30,53,96,0.7)',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Teams link modal ── */}
      {teamsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => { if (!teamsSending) { setTeamsModal(null); setTeamsSuccess(null); setTeamsError('') } }}
        >
          <div
            className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#378ADD' }}>Send Teams Link</p>
                <p className="text-sm font-bold leading-snug" style={{ color: '#0D3B6E' }}>{teamsModal.workshopName}</p>
              </div>
              {!teamsSending && (
                <button
                  onClick={() => { setTeamsModal(null); setTeamsSuccess(null); setTeamsError('') }}
                  className="rounded-full p-1 transition-colors hover:bg-gray-100"
                  style={{ color: 'rgba(43,48,58,0.4)' }}
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {teamsSuccess !== null ? (
              <div className="text-center py-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-bold mb-1" style={{ color: '#15803d' }}>Teams link sent!</p>
                <p className="text-sm" style={{ color: 'rgba(43,48,58,0.6)' }}>
                  Emailed to {teamsSuccess} virtual {teamsSuccess === 1 ? 'registrant' : 'registrants'}.
                </p>
                <button
                  onClick={() => { setTeamsModal(null); setTeamsSuccess(null); setTeamsError('') }}
                  className="mt-5 rounded-lg px-5 py-2 text-xs font-bold text-white"
                  style={{ backgroundColor: '#0D3B6E' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm mb-5" style={{ color: 'rgba(43,48,58,0.7)' }}>
                  Send Teams meeting link to all virtual registrants of{' '}
                  <strong style={{ color: '#0D3B6E' }}>{teamsModal.workshopName}</strong>{' '}
                  on {teamsModal.dateStr}?{' '}
                  This will email{' '}
                  <strong style={{ color: '#0D3B6E' }}>{teamsModal.count} virtual {teamsModal.count === 1 ? 'registrant' : 'registrants'}</strong>.
                </p>

                {teamsError && (
                  <p className="mb-4 text-xs rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(220,38,38,0.07)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
                    {teamsError}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => sendTeamsLink(teamsModal.dateId)}
                    disabled={teamsSending}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white transition-colors duration-150 disabled:opacity-60"
                    style={{ backgroundColor: '#378ADD' }}
                  >
                    {teamsSending ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white shrink-0" style={{ animation: 'spin 0.75s linear infinite' }} aria-hidden />
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Send Teams Link
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setTeamsModal(null); setTeamsError('') }}
                    disabled={teamsSending}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 hover:bg-gray-50 disabled:opacity-40"
                    style={{ color: 'rgba(30,53,96,0.55)', border: '1.5px solid rgba(30,53,96,0.12)' }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Date list ── */}
      <div className="p-4 flex flex-col gap-3">
        {dates.filter(d => !isPast(d.date)).length === 0 && (
          <p className="text-center py-10 text-sm" style={{ color: 'rgba(43,48,58,0.38)' }}>
            No upcoming dates — add one above.
          </p>
        )}

        {dates.filter(d => !isPast(d.date)).map(d => {
          const regCount  = registeredCount(d._id, registrations)
          const wlCount   = waitlistCount(d._id, waitlist)
          const cap       = d.offering?.capacity ?? 0
          const past      = isPast(d.date)
          const inactive  = !d.active || past
          const isBusy    = busyIds.has(d._id)
          const isEditing = editingId === d._id

          if (isEditing) {
            return (
              <div
                key={d._id}
                className="rounded-xl p-4"
                style={{ backgroundColor: '#F4F7F9', border: '1.5px solid rgba(30,53,96,0.1)' }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(30,53,96,0.45)' }}>
                  Editing Date
                </p>
                <p className="text-sm font-semibold mb-3" style={{ color: '#1E3560' }}>
                  {d.offering?.title ?? 'Workshop Date'}
                </p>
                <form onSubmit={saveEdit} noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Date + time */}
                    <div>
                      <label className={labelCls} style={labelStyle}>
                        Date &amp; Time <span className="normal-case font-normal">(Mountain Time)</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={editForm.date}
                        onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                        className={inputCls + ' cursor-pointer'}
                        style={inputStyle}
                      />
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={editForm.active}
                          onClick={() => setEditForm(f => ({ ...f, active: !f.active }))}
                          className="relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 shrink-0"
                          style={{ backgroundColor: editForm.active ? '#22c55e' : 'rgba(43,48,58,0.2)' }}
                        >
                          <span
                            className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                            style={{ transform: editForm.active ? 'translateX(16px)' : 'translateX(0)' }}
                          />
                        </button>
                        <span className="text-sm font-medium" style={{ color: '#1E3560' }}>
                          {editForm.active ? 'Active — visible in registration form' : 'Inactive — hidden from registration form'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {editError && <p className="text-xs mt-3" style={{ color: '#dc2626' }}>{editError}</p>}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={editBusy}
                      className="rounded-lg px-5 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors duration-150 hover:bg-[#15294a]"
                      style={{ backgroundColor: '#1E3560' }}
                    >
                      {editBusy ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingId(null); setEditError('') }}
                      className="rounded-lg px-5 py-2 text-xs font-semibold transition-colors duration-150 hover:bg-[#e0e8f0]"
                      style={{ color: 'rgba(30,53,96,0.55)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={editBusy}
                      onClick={() => deleteDate(d._id)}
                      className="ml-auto rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors duration-150 hover:bg-red-700"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      Delete
                    </button>
                  </div>
                </form>
              </div>
            )
          }

          return (
            <div
              key={d._id}
              className="rounded-xl p-4 flex items-start gap-4"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid rgba(30,53,96,0.09)',
                borderLeft: borderColor(d, regCount),
                opacity: inactive ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {/* Left: info */}
              <div className="flex-1 min-w-0">
                {/* Workshop name */}
                <p className="text-sm font-bold leading-snug mb-1" style={{ color: '#1E3560' }}>
                  {d.offering?.title ?? '—'}
                </p>

                {/* Date + time */}
                <p className="text-sm mb-2" style={{ color: 'rgba(43,48,58,0.65)' }}>
                  {fmtDate(d.date)} · {fmtTime(d.date)}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category badge */}
                  {d.offering?.category && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${CATEGORY_COLOUR[d.offering.category] ?? '#888'}18`,
                        color: CATEGORY_COLOUR[d.offering.category] ?? '#888',
                      }}
                    >
                      {CATEGORY_LABEL[d.offering.category] ?? d.offering.category}
                    </span>
                  )}

                  {/* Virtual badge */}
                  {d.offering?.hasVirtualOption && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(55,138,221,0.12)', color: '#378ADD' }}
                    >
                      + Virtual
                    </span>
                  )}

                  {/* Capacity */}
                  {cap > 0 && (
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: regCount >= cap
                          ? 'rgba(230,126,34,0.1)' : 'rgba(30,53,96,0.07)',
                        color: regCount >= cap ? '#E67E22' : 'rgba(43,48,58,0.55)',
                      }}
                    >
                      {regCount}/{cap} registered
                    </span>
                  )}

                  {/* Waitlist */}
                  {wlCount > 0 && (
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}
                    >
                      {wlCount} on waitlist
                    </span>
                  )}

                  {/* Status badge */}
                  {past ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(43,48,58,0.07)', color: 'rgba(43,48,58,0.45)' }}>Past</span>
                  ) : d.active ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>Active</span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(43,48,58,0.07)', color: 'rgba(43,48,58,0.45)' }}>Inactive</span>
                  )}

                  {cap > 0 && regCount >= cap && d.active && !past && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(230,126,34,0.1)', color: '#E67E22' }}>Full</span>
                  )}
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                {d.teamsLink && d.offering?.hasVirtualOption && (
                  <button
                    onClick={() => setTeamsModal({
                      dateId: d._id,
                      workshopName: d.offering?.title ?? '',
                      dateStr: fmtDate(d.date) + ' · ' + fmtTime(d.date),
                      count: d.virtualRegistrantCount ?? 0,
                    })}
                    disabled={isBusy}
                    title="Send Teams meeting link to virtual registrants"
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors duration-150 hover:border-[#378ADD] disabled:opacity-40 flex items-center gap-1"
                    style={{ borderColor: '#378ADD', color: '#378ADD' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 shrink-0" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Teams
                  </button>
                )}
                <button
                  onClick={() => { setQrModalId(d._id); setCopied(false) }}
                  disabled={isBusy}
                  title="Show QR Code"
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors duration-150 hover:border-[#E67E22] hover:text-[#E67E22] disabled:opacity-40"
                  style={{ borderColor: 'rgba(30,53,96,0.15)', color: 'rgba(43,48,58,0.5)' }}
                >
                  QR
                </button>
                <button
                  onClick={() => startEdit(d)}
                  disabled={isBusy}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors duration-150 hover:border-[#378ADD] hover:text-[#378ADD] disabled:opacity-40"
                  style={{ borderColor: 'rgba(30,53,96,0.15)', color: 'rgba(30,53,96,0.6)' }}
                >
                  Edit
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
