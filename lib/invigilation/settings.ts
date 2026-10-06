// Shared (client + server) exam invigilation rules. No server-only imports here.
// All dates are "YYYY-MM-DD" and all times are whole hours in Edmonton local time
// (Alberta is UTC-6 year-round).

export type DayKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

export const DAY_KEYS: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export interface DayHours {
  day: DayKey
  open: string // "08:00"
  close: string // "16:00"
}

export interface ClosedDate {
  date: string
  from?: string // "12:00" — leave from/until empty to close the whole day
  until?: string // "14:00"
  reason?: string
}

export interface InvigilationSettings {
  bookingsOpen: boolean
  sessionLengths: number[]
  sessionPrice: number
  verbalReaderPrice: number
  maxStudentsPerHour: number
  minDaysNotice: number
  maxDaysAhead: number
  weeklyHours: DayHours[]
  closedDates: ClosedDate[]
}

export const DEFAULT_INVIGILATION_SETTINGS: InvigilationSettings = {
  bookingsOpen: true,
  sessionLengths: [1, 2, 3],
  sessionPrice: 40,
  verbalReaderPrice: 40,
  maxStudentsPerHour: 4,
  minDaysNotice: 7,
  maxDaysAhead: 90,
  weeklyHours: [
    { day: 'monday', open: '08:00', close: '16:00' },
    { day: 'tuesday', open: '08:00', close: '20:00' },
    { day: 'wednesday', open: '08:00', close: '20:00' },
    { day: 'thursday', open: '08:00', close: '20:00' },
    { day: 'friday', open: '08:00', close: '16:00' },
    { day: 'saturday', open: '09:00', close: '13:00' },
  ],
  closedDates: [],
}

export const ACCOMMODATION_OPTIONS = [
  { value: 'quiet-room', label: 'Quiet room' },
  { value: 'headphones', label: 'Noise-cancelling headphones' },
  { value: 'extra-time', label: 'Extra time' },
  { value: 'verbal-reader', label: 'Verbal exam reader' },
  { value: 'other', label: 'Other' },
] as const

export type AccommodationValue = (typeof ACCOMMODATION_OPTIONS)[number]['value']

export function accommodationLabel(value: string): string {
  return ACCOMMODATION_OPTIONS.find(o => o.value === value)?.label ?? value
}

export const HOLD_MINUTES = 30

// ── Dates ──────────────────────────────────────────────────────────────────

export function edmontonToday(now: Date = new Date()): string {
  return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function dayKeyOf(ymd: string): DayKey {
  return DAY_KEYS[new Date(`${ymd}T12:00:00Z`).getUTCDay()]
}

export function formatDateLong(ymd: string): string {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-CA', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function hourOf(time: string): number {
  return Number(time.slice(0, 2))
}

export function timeOf(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

export function formatHour(hour: number): string {
  const h = ((hour + 11) % 12) + 1
  return `${h}:00 ${hour < 12 || hour === 24 ? 'AM' : 'PM'}`
}

export function formatTimeRange(startTime: string, durationHours: number): string {
  const start = hourOf(startTime)
  return `${formatHour(start)} – ${formatHour(start + durationHours)}`
}

// ── Availability ───────────────────────────────────────────────────────────

export function bookingWindow(settings: InvigilationSettings, today = edmontonToday()) {
  return {
    minDate: addDays(today, settings.minDaysNotice),
    maxDate: addDays(today, settings.maxDaysAhead),
  }
}

// Students who need extra time can't book the shortest session
export const EXTRA_TIME_MIN_HOURS = 2

export function lengthsFor(settings: InvigilationSettings, accommodations: string[]): number[] {
  const lengths = [...new Set(settings.sessionLengths)].filter(h => h >= 1).sort((a, b) => a - b)
  if (!accommodations.includes('extra-time')) return lengths
  return lengths.filter(h => h >= EXTRA_TIME_MIN_HOURS)
}

const isWholeDay = (c: ClosedDate) => !c.from && !c.until

export function hoursFor(settings: InvigilationSettings, ymd: string): { open: number; close: number } | null {
  if (settings.closedDates.some(c => c.date === ymd && isWholeDay(c))) return null
  const day = settings.weeklyHours.find(h => h.day === dayKeyOf(ymd))
  if (!day) return null
  const open = hourOf(day.open)
  const close = hourOf(day.close)
  if (!(close > open)) return null
  return { open, close }
}

export function isDateBookable(settings: InvigilationSettings, ymd: string, today = edmontonToday()): boolean {
  if (!settings.bookingsOpen) return false
  const { minDate, maxDate } = bookingWindow(settings, today)
  if (ymd < minDate || ymd > maxDate) return false
  return hoursFor(settings, ymd) !== null
}

export interface ExistingBooking {
  startTime: string
  durationHours: number
  exclusive: boolean
}

export interface Slot {
  start: string
  seatsLeft: number
  // Whether a booking of each length (in hours) can start here
  shared: Record<number, boolean>
  exclusive: Record<number, boolean>
}

export function computeSlots(settings: InvigilationSettings, ymd: string, bookings: ExistingBooking[]): Slot[] {
  const hours = hoursFor(settings, ymd)
  if (!hours) return []

  // Hours blocked off by a partial-day closure in Settings
  const blocked = new Set<number>()
  for (const c of settings.closedDates) {
    if (c.date !== ymd || isWholeDay(c)) continue
    const from = c.from ? hourOf(c.from) : hours.open
    const until = c.until ? hourOf(c.until) : hours.close
    for (let h = from; h < until; h++) blocked.add(h)
  }

  const load = new Map<number, { count: number; exclusive: boolean }>()
  for (let h = hours.open; h < hours.close; h++) if (!blocked.has(h)) load.set(h, { count: 0, exclusive: false })
  for (const b of bookings) {
    const start = hourOf(b.startTime)
    for (let h = start; h < start + b.durationHours; h++) {
      const l = load.get(h)
      if (!l) continue
      l.count += 1
      if (b.exclusive) l.exclusive = true
    }
  }

  const max = settings.maxStudentsPerHour
  const span = (start: number, duration: number) => {
    const out = []
    for (let h = start; h < start + duration; h++) {
      const l = load.get(h)
      if (!l || h >= hours.close) return null
      out.push(l)
    }
    return out
  }
  const canShare = (start: number, duration: number) =>
    span(start, duration)?.every(l => !l.exclusive && l.count < max) ?? false
  const canExclusive = (start: number, duration: number) =>
    span(start, duration)?.every(l => l.count === 0) ?? false
  const lengths = lengthsFor(settings, [])

  const slots: Slot[] = []
  for (let h = hours.open; h < hours.close; h++) {
    const l = load.get(h)
    if (!l) continue
    slots.push({
      start: timeOf(h),
      seatsLeft: l.exclusive ? 0 : Math.max(0, max - l.count),
      shared: Object.fromEntries(lengths.map(d => [d, canShare(h, d)])),
      exclusive: Object.fromEntries(lengths.map(d => [d, canExclusive(h, d)])),
    })
  }
  return slots
}

export function bookingPrice(settings: InvigilationSettings, accommodations: string[]): number {
  return settings.sessionPrice + (accommodations.includes('verbal-reader') ? settings.verbalReaderPrice : 0)
}
