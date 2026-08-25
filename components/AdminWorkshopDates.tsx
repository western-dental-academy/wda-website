'use client'

import { useState } from 'react'
import type { WorkshopRegistration } from './AdminWorkshopRegistrations'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WorkshopDateItem {
  _id: string
  workshop: string
  date: string
  capacity: number
  active: boolean
  category: string
}

interface Props {
  initialDates: WorkshopDateItem[]
  registrations: WorkshopRegistration[]
}

// ── Constants ──────────────────────────────────────────────────────────────────

const WORKSHOP_OPTIONS = [
  'Ergonomics in Dentistry: Move Well, Breathe Well, Practice Longer',
]

const CATEGORY_OPTIONS = [
  { value: 'workshop',      label: 'Workshop'      },
  { value: 'course',        label: 'Course'        },
  { value: 'guest-speaker', label: 'Guest Speaker' },
]

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

const BLANK_ADD = { workshop: WORKSHOP_OPTIONS[0], date: '', capacity: 15, category: 'workshop' }

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

function borderColor(date: WorkshopDateItem, regCount: number): string {
  if (!date.active || isPast(date.date)) return '3px solid rgba(43,48,58,0.12)'
  if (regCount >= date.capacity)         return '3px solid #E67E22'
  return '3px solid #22c55e'
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FormFields({
  workshop, date, capacity, category,
  onChange,
  showActiveToggle, active, onActiveChange,
}: {
  workshop: string; date: string; capacity: number; category: string
  onChange: (field: string, value: string | number) => void
  showActiveToggle?: boolean; active?: boolean; onActiveChange?: (v: boolean) => void
}) {
  const inputCls = 'w-full rounded-lg px-3 py-2 text-sm border bg-white outline-none focus:ring-2 focus:ring-[#378ADD]/20'
  const inputStyle = { borderColor: 'rgba(30,53,96,0.15)', color: '#1E3560' }
  const labelCls = 'block text-[11px] font-bold uppercase tracking-wide mb-1'
  const labelStyle = { color: 'rgba(30,53,96,0.5)' }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Category */}
      <div>
        <label className={labelCls} style={labelStyle}>Category</label>
        <select
          value={category}
          onChange={e => onChange('category', e.target.value)}
          className={inputCls + ' cursor-pointer'}
          style={inputStyle}
        >
          {CATEGORY_OPTIONS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Offering */}
      <div>
        <label className={labelCls} style={labelStyle}>Offering</label>
        <select
          value={workshop}
          onChange={e => onChange('workshop', e.target.value)}
          className={inputCls + ' cursor-pointer'}
          style={inputStyle}
        >
          {WORKSHOP_OPTIONS.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>

      {/* Date + time */}
      <div className="sm:col-span-1">
        <label className={labelCls} style={labelStyle}>
          Date &amp; Time <span className="normal-case font-normal">(Mountain Time)</span>
        </label>
        <input
          type="datetime-local"
          value={date}
          onChange={e => onChange('date', e.target.value)}
          className={inputCls + ' cursor-pointer'}
          style={inputStyle}
        />
      </div>

      {/* Capacity */}
      <div>
        <label className={labelCls} style={labelStyle}>Capacity</label>
        <input
          type="number"
          min={1}
          max={200}
          value={capacity}
          onChange={e => onChange('capacity', parseInt(e.target.value, 10) || 1)}
          className={inputCls}
          style={inputStyle}
        />
      </div>

      {/* Active toggle (edit only) */}
      {showActiveToggle && onActiveChange && (
        <div className="sm:col-span-2 flex items-center gap-2.5">
          <button
            type="button"
            role="switch"
            aria-checked={active}
            onClick={() => onActiveChange(!active)}
            className="relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 shrink-0"
            style={{ backgroundColor: active ? '#22c55e' : 'rgba(43,48,58,0.2)' }}
          >
            <span
              className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: active ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </button>
          <span className="text-sm font-medium" style={{ color: '#1E3560' }}>
            {active ? 'Active — visible in registration form' : 'Inactive — hidden from registration form'}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminWorkshopDates({ initialDates, registrations }: Props) {
  const [dates,      setDates]      = useState<WorkshopDateItem[]>(initialDates)
  const [showAdd,    setShowAdd]    = useState(false)
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [busyIds,    setBusyIds]    = useState<Set<string>>(new Set())

  const [addForm,    setAddForm]    = useState(BLANK_ADD)
  const [addBusy,    setAddBusy]    = useState(false)
  const [addError,   setAddError]   = useState('')

  const [editForm,   setEditForm]   = useState({ workshop: '', date: '', capacity: 15, active: true, category: 'workshop' })
  const [editBusy,   setEditBusy]   = useState(false)
  const [editError,  setEditError]  = useState('')

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function setBusy(id: string, on: boolean) {
    setBusyIds(prev => { const n = new Set(prev); on ? n.add(id) : n.delete(id); return n })
  }

  function startEdit(d: WorkshopDateItem) {
    setEditingId(d._id)
    setEditForm({
      workshop: d.workshop,
      date:     utcToMountainLocal(d.date),
      capacity: d.capacity,
      active:   d.active,
      category: d.category ?? 'workshop',
    })
    setEditError('')
    setShowAdd(false)
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function createDate(e: React.FormEvent) {
    e.preventDefault()
    if (!addForm.date) { setAddError('Please select a date and time.'); return }
    setAddBusy(true); setAddError('')

    try {
      const res = await fetch('/api/admin/workshop-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshop: addForm.workshop,
          date:     mountainLocalToUTC(addForm.date),
          capacity: addForm.capacity,
          category: addForm.category,
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
          workshop: editForm.workshop,
          date:     mountainLocalToUTC(editForm.date),
          capacity: editForm.capacity,
          active:   editForm.active,
          category: editForm.category,
        }),
      })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? 'Error') }

      const id = editingId
      setDates(prev =>
        prev
          .map(d => d._id === id ? {
            ...d,
            workshop: editForm.workshop,
            date:     mountainLocalToUTC(editForm.date),
            capacity: editForm.capacity,
            active:   editForm.active,
            category: editForm.category,
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

  async function deactivate(id: string) {
    if (!confirm('Deactivate this workshop date? It will be hidden from the registration form.')) return
    setBusy(id, true)
    try {
      const res = await fetch(`/api/admin/workshop-dates/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setDates(prev => prev.map(d => d._id === id ? { ...d, active: false } : d))
    } catch {
      alert('Failed to deactivate date. Please try again.')
    } finally {
      setBusy(id, false)
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
          className="px-6 py-5 border-b"
          style={{ borderColor: 'rgba(30,53,96,0.08)', backgroundColor: '#F4F7F9' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(30,53,96,0.45)' }}>
            New Offering
          </p>
          <form onSubmit={createDate} noValidate>
            <FormFields
              workshop={addForm.workshop}
              date={addForm.date}
              capacity={addForm.capacity}
              category={addForm.category}
              onChange={(field, val) => setAddForm(f => ({ ...f, [field]: val }))}
            />
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

      {/* ── Date list ── */}
      <div className="p-4 flex flex-col gap-3">
        {dates.length === 0 && (
          <p className="text-center py-10 text-sm" style={{ color: 'rgba(43,48,58,0.38)' }}>
            No offerings yet — add one above.
          </p>
        )}

        {dates.map(d => {
          const regCount  = registeredCount(d._id, registrations)
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
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(30,53,96,0.45)' }}>
                  Editing Date
                </p>
                <form onSubmit={saveEdit} noValidate>
                  <FormFields
                    workshop={editForm.workshop}
                    date={editForm.date}
                    capacity={editForm.capacity}
                    category={editForm.category}
                    onChange={(field, val) => setEditForm(f => ({ ...f, [field]: val }))}
                    showActiveToggle
                    active={editForm.active}
                    onActiveChange={v => setEditForm(f => ({ ...f, active: v }))}
                  />
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
                  {d.workshop}
                </p>

                {/* Date + time */}
                <p className="text-sm mb-2" style={{ color: 'rgba(43,48,58,0.65)' }}>
                  {fmtDate(d.date)} · {fmtTime(d.date)}
                </p>

                {/* Capacity + registration count + status */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category badge */}
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${CATEGORY_COLOUR[d.category ?? 'workshop']}18`,
                      color: CATEGORY_COLOUR[d.category ?? 'workshop'],
                    }}
                  >
                    {CATEGORY_LABEL[d.category ?? 'workshop']}
                  </span>

                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: regCount >= d.capacity
                        ? 'rgba(230,126,34,0.1)' : 'rgba(30,53,96,0.07)',
                      color: regCount >= d.capacity ? '#E67E22' : 'rgba(43,48,58,0.55)',
                    }}
                  >
                    {regCount}/{d.capacity} registered
                  </span>

                  {/* Status badge */}
                  {past ? (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(43,48,58,0.07)', color: 'rgba(43,48,58,0.45)' }}
                    >
                      Past
                    </span>
                  ) : d.active ? (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                    >
                      Active
                    </span>
                  ) : (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(43,48,58,0.07)', color: 'rgba(43,48,58,0.45)' }}
                    >
                      Inactive
                    </span>
                  )}

                  {regCount >= d.capacity && d.active && !past && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(230,126,34,0.1)', color: '#E67E22' }}
                    >
                      Full
                    </span>
                  )}
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <button
                  onClick={() => startEdit(d)}
                  disabled={isBusy}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors duration-150 hover:border-[#378ADD] hover:text-[#378ADD] disabled:opacity-40"
                  style={{ borderColor: 'rgba(30,53,96,0.15)', color: 'rgba(30,53,96,0.6)' }}
                >
                  Edit
                </button>
                {d.active && !past && (
                  <button
                    onClick={() => deactivate(d._id)}
                    disabled={isBusy}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors duration-150 hover:border-[#dc2626]/40 hover:text-[#dc2626] disabled:opacity-40"
                    style={{ borderColor: 'rgba(30,53,96,0.15)', color: 'rgba(43,48,58,0.5)' }}
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
