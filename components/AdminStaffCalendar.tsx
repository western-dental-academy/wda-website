'use client'

import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface TimeOffRequest {
  _id: string
  type: string
  startDate: string
  endDate: string
  staffMember: { fullName: string }
}

interface WorkshopDate {
  _id: string
  workshop: string
  date: string
  capacity: number
}

interface Props {
  requests: TimeOffRequest[]
  workshopDates: WorkshopDate[]
}

// ── Constants ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { bg: string; text: string; label: string }> = {
  vacation: { bg: '#378ADD', text: '#fff', label: 'Vacation' },
  sick:     { bg: '#dc2626', text: '#fff', label: 'Sick Day' },
  personal: { bg: '#E67E22', text: '#fff', label: 'Day Off'  },
  unpaid:   { bg: '#E67E22', text: '#fff', label: 'Day Off'  },
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

// ── Helpers ────────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, '0') }

function formatWorkshopDate(dateStr: string): string {
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function buildDayMap(
  requests: TimeOffRequest[],
  year: number,
  month: number
): Record<number, Array<{ fullName: string; type: string }>> {
  const daysInMonth = new Date(year, month, 0).getDate()
  const map: Record<number, Array<{ fullName: string; type: string }>> = {}
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${pad(month)}-${pad(d)}`
    const entries: Array<{ fullName: string; type: string }> = []
    for (const r of requests) {
      if (r.startDate <= dateStr && r.endDate >= dateStr) {
        entries.push({ fullName: r.staffMember.fullName, type: r.type })
      }
    }
    if (entries.length) map[d] = entries
  }
  return map
}

function buildWorkshopDayMap(
  workshopDates: WorkshopDate[],
  year: number,
  month: number
): Record<number, WorkshopDate[]> {
  const map: Record<number, WorkshopDate[]> = {}
  const monthStr = `${year}-${pad(month)}`
  for (const w of workshopDates) {
    if (w.date.startsWith(monthStr)) {
      const day = parseInt(w.date.split('-')[2], 10)
      if (!map[day]) map[day] = []
      map[day].push(w)
    }
  }
  return map
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminStaffCalendar({ requests, workshopDates }: Props) {
  const today = new Date()
  const [year,        setYear]        = useState(today.getFullYear())
  const [month,       setMonth]       = useState(today.getMonth() + 1) // 1-based
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  function prevMonth() {
    setSelectedDay(null)
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    setSelectedDay(null)
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  function toggleDay(day: number) {
    setSelectedDay(prev => (prev === day ? null : day))
  }

  // Calendar grid
  const firstDow   = new Date(year, month - 1, 1).getDay()           // 0=Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1              // Monday-first
  const daysInMonth = new Date(year, month, 0).getDate()
  const totalCells  = startOffset + daysInMonth
  const rows        = Math.ceil(totalCells / 7)
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array(rows * 7 - totalCells).fill(null),
  ]

  const dayMap         = buildDayMap(requests, year, month)
  const workshopDayMap = buildWorkshopDayMap(workshopDates, year, month)
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const todayDate      = today.getDate()

  const selectedEntries   = selectedDay ? (dayMap[selectedDay] ?? []) : []
  const selectedWorkshops = selectedDay ? (workshopDayMap[selectedDay] ?? []) : []

  return (
    <div className="rounded-2xl bg-white overflow-hidden mb-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>

      {/* ── Header ── */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Staff Calendar</h2>

          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              aria-label="Previous month"
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150 hover:bg-[#F4F7F9]"
              style={{ color: 'rgba(30,53,96,0.5)' }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
                <path fillRule="evenodd" clipRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
            </button>
            <span className="text-sm font-semibold tabular-nums min-w-[130px] text-center" style={{ color: '#1E3560' }}>
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button
              onClick={nextMonth}
              aria-label="Next month"
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150 hover:bg-[#F4F7F9]"
              style={{ color: 'rgba(30,53,96,0.5)' }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
                <path fillRule="evenodd" clipRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3">
          {[
            { label: 'Vacation', bg: '#378ADD' },
            { label: 'Sick Day', bg: '#dc2626' },
            { label: 'Day Off',  bg: '#E67E22' },
            { label: 'Workshop', bg: '#16a34a' },
          ].map(({ label, bg }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: bg }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div className="p-4">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold py-1" style={{ color: 'rgba(43,48,58,0.35)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-px" style={{ backgroundColor: 'rgba(30,53,96,0.06)' }}>
          {cells.map((day, i) => {
            const isToday    = isCurrentMonth && day === todayDate
            const isSelected = day !== null && day === selectedDay
            const entries         = day ? (dayMap[day] ?? []) : []
            const workshopEntries = day ? (workshopDayMap[day] ?? []) : []
            const hasEntries      = entries.length > 0 || workshopEntries.length > 0

            return (
              <div
                key={i}
                onClick={day && hasEntries ? () => toggleDay(day) : undefined}
                className="bg-white min-h-[70px] p-1.5"
                style={{
                  backgroundColor: isSelected
                    ? 'rgba(30,53,96,0.05)'
                    : isToday
                    ? 'rgba(55,138,221,0.05)'
                    : '#fff',
                  cursor: day && hasEntries ? 'pointer' : 'default',
                }}
              >
                {day !== null && (
                  <>
                    {/* Day number */}
                    <span
                      className="text-[11px] block text-right pr-0.5 mb-1 leading-none"
                      style={{
                        color: isToday ? '#1E3560' : 'rgba(43,48,58,0.5)',
                        fontWeight: isToday ? 700 : 400,
                      }}
                    >
                      {isToday ? (
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px] font-bold"
                          style={{ backgroundColor: '#1E3560' }}
                        >
                          {day}
                        </span>
                      ) : day}
                    </span>

                    {/* Entry pills */}
                    <div className="space-y-0.5">
                      {entries.slice(0, 3).map((e, j) => {
                        const meta = TYPE_META[e.type] ?? { bg: '#6b7280', text: '#fff', label: e.type }
                        const first = e.fullName.split(' ')[0]
                        return (
                          <div
                            key={j}
                            className="text-[10px] font-medium px-1 rounded truncate leading-[14px]"
                            style={{ backgroundColor: meta.bg, color: meta.text }}
                            title={`${e.fullName} — ${meta.label}`}
                          >
                            {first}
                          </div>
                        )
                      })}
                      {entries.length > 3 && (
                        <div className="text-[10px] px-1 leading-[14px]" style={{ color: 'rgba(43,48,58,0.4)' }}>
                          +{entries.length - 3} more
                        </div>
                      )}
                      {workshopEntries.map((w, j) => (
                        <div
                          key={`ws-${j}`}
                          className="text-[10px] font-medium px-1 rounded truncate leading-[14px]"
                          style={{ backgroundColor: '#16a34a', color: '#fff' }}
                          title={`Workshop: ${w.workshop}`}
                        >
                          Workshop
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Day detail panel ── */}
      {selectedDay !== null && (
        <div
          className="mx-4 mb-4 rounded-xl p-4"
          style={{ backgroundColor: '#F4F7F9', border: '1px solid rgba(30,53,96,0.08)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(30,53,96,0.45)' }}>
              {MONTH_NAMES[month - 1]} {selectedDay}
            </p>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs font-semibold transition-colors duration-150 hover:opacity-70"
              style={{ color: 'rgba(30,53,96,0.4)' }}
              aria-label="Close day detail"
            >
              ✕
            </button>
          </div>

          {selectedEntries.length === 0 && selectedWorkshops.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(43,48,58,0.4)' }}>Nothing on this day.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedEntries.map((e, i) => {
                const meta = TYPE_META[e.type] ?? { bg: '#6b7280', text: '#fff', label: e.type }
                return (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: '#1E3560' }}>
                      {e.fullName}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${meta.bg}18`, color: meta.bg, border: `1px solid ${meta.bg}40` }}
                    >
                      {meta.label}
                    </span>
                  </div>
                )
              })}
              {selectedWorkshops.map((w) => (
                <div key={w._id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-sm font-medium block" style={{ color: '#1E3560' }}>
                      {w.workshop}
                    </span>
                    <span className="text-[11px]" style={{ color: 'rgba(43,48,58,0.45)' }}>
                      {formatWorkshopDate(w.date)}
                    </span>
                  </div>
                  <span
                    className="shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#16a34a18', color: '#16a34a', border: '1px solid #16a34a40' }}
                  >
                    Workshop
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
