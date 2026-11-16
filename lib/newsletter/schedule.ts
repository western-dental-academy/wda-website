// Newsletter date helpers. Alberta is UTC-6 all year (no DST), so every send
// time is built with a fixed -06:00 offset. Never use America/Edmonton here.
// This file is imported by the Sanity schema too, so it must stay browser-safe.

export const ALBERTA_OFFSET = '-06:00'
const OFFSET_MS = 6 * 60 * 60 * 1000

export const SEND_TIME_OPTIONS = [
  { title: '7:00 AM', value: '07:00' },
  { title: '8:00 AM', value: '08:00' },
  { title: '9:00 AM', value: '09:00' },
  { title: '10:00 AM', value: '10:00' },
  { title: '11:00 AM', value: '11:00' },
  { title: '12:00 PM', value: '12:00' },
  { title: '1:00 PM', value: '13:00' },
  { title: '2:00 PM', value: '14:00' },
  { title: '3:00 PM', value: '15:00' },
  { title: '4:00 PM', value: '16:00' },
  { title: '5:00 PM', value: '17:00' },
  { title: '6:00 PM', value: '18:00' },
  { title: '7:00 PM', value: '19:00' },
]

/** "2026-12-01" + "10:00" → Date for 10:00 Alberta time (16:00 UTC). */
export function albertaSendTime(sendDate: string, sendTime: string): Date {
  return new Date(`${sendDate}T${sendTime || '10:00'}:00${ALBERTA_OFFSET}`)
}

/** Today's date in Alberta as YYYY-MM-DD. */
export function albertaToday(now = new Date()): string {
  return new Date(now.getTime() - OFFSET_MS).toISOString().slice(0, 10)
}

/** First Tuesday of the given month (month is 0-based), as YYYY-MM-DD. */
export function firstTuesday(year: number, month: number): string {
  const first = new Date(Date.UTC(year, month, 1))
  const add = (2 - first.getUTCDay() + 7) % 7 // 2 = Tuesday
  return new Date(Date.UTC(year, month, 1 + add)).toISOString().slice(0, 10)
}

/** The next first-Tuesday-of-a-month that is still ahead of today (Alberta). */
export function nextFirstTuesday(now = new Date()): string {
  const today = albertaToday(now)
  const [y, m] = today.split('-').map(Number)
  const thisMonth = firstTuesday(y, m - 1)
  if (thisMonth > today) return thisMonth
  return m === 12 ? firstTuesday(y + 1, 0) : firstTuesday(y, m)
}

/** e.g. "Tuesday, December 1 at 10:00 AM" in Alberta time. */
export function formatAlberta(date: Date, opts: { withTime?: boolean; withWeekday?: boolean } = {}): string {
  const { withTime = true, withWeekday = true } = opts
  const day = date.toLocaleDateString('en-CA', {
    timeZone: 'America/Regina',
    weekday: withWeekday ? 'long' : undefined,
    month: 'long',
    day: 'numeric',
  })
  if (!withTime) return day
  const time = date.toLocaleTimeString('en-CA', { timeZone: 'America/Regina', hour: 'numeric', minute: '2-digit' })
  return `${day} at ${time.replace('a.m.', 'AM').replace('p.m.', 'PM')}`
}

// ── Default wording ──────────────────────────────────────────────────────────
// New newsletters start with this wording. "{month}" is swapped for the month
// of the send date when the email is built, so changing the date keeps it right.

export const MONTH_TOKEN = '{month}'
export const DEFAULT_SUBJECT = 'Your {month} update from Western Dental Academy'
export const DEFAULT_PREVIEW_TEXT = "What's new at WDA this {month}: upcoming workshops, online courses and a quick tip."
export const DEFAULT_HEADLINE = 'Your {month} update from WDA'

/** "2026-12-01" → "December" */
export function monthName(sendDate: string | undefined): string {
  const d = sendDate ? new Date(`${sendDate}T12:00:00${ALBERTA_OFFSET}`) : new Date()
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Regina', month: 'long' })
}

/** Replaces {month} (any capitalisation) with the send date's month. */
export function fillMonth(text: string | undefined, sendDate: string | undefined): string {
  return (text ?? '').replace(/\{month\}/gi, monthName(sendDate))
}
