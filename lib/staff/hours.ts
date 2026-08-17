import type { SanityClient } from '@sanity/client'

// Matches the constant in app/staff/owner/page.tsx.
// Update in both places if the policy changes.
export const EXPECTED_WEEKLY_HOURS = 37.5

/**
 * Count expected working hours in [startMs, endMs) by summing Mon–Fri days and
 * multiplying by 7.5h/day (EXPECTED_WEEKLY_HOURS ÷ 5).
 *
 * Rationale for counting actual calendar days rather than using a fixed ×4.33
 * monthly multiplier: a full Mon–Sun always yields 37.5h, a 23-working-day
 * month yields 172.5h, and short months (e.g. February) are handled correctly
 * without a rounding assumption. We set the cursor to noon UTC to sidestep any
 * DST boundary issues on the first day of the range.
 */
export function expectedHoursForPeriod(startMs: number, endMs: number): number {
  let workingDays = 0
  const d = new Date(startMs)
  d.setUTCHours(12, 0, 0, 0)
  while (d.getTime() < endMs) {
    const dow = d.getUTCDay() // 0 = Sun, 6 = Sat
    if (dow !== 0 && dow !== 6) workingDays++
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return workingDays * (EXPECTED_WEEKLY_HOURS / 5)
}

export type HoursLogEntry = {
  staffId: string
  clockIn: string
  clockOut: string | null
  notes?: string | null
}

export type StaffSummaryRow = {
  _id: string
  fullName: string
  hours: number
  expectedHours: number
  /** True if the member worked >0h but fell below 90% of expected — same threshold as /staff/owner. */
  flagged: boolean
  /** Clock-out notes left during the period, oldest-first, entries with no note excluded. */
  noteEntries: Array<{ date: string; text: string }>
}

function hoursInRange(
  logs: HoursLogEntry[],
  staffId: string,
  startMs: number,
  endMs: number,
): number {
  return logs
    .filter(l => {
      const ci = new Date(l.clockIn).getTime()
      return l.staffId === staffId && ci >= startMs && ci < endMs
    })
    .reduce((sum, l) => {
      const s = new Date(l.clockIn).getTime()
      const e = l.clockOut ? new Date(l.clockOut).getTime() : Date.now()
      return sum + Math.max(0, e - s) / 3_600_000
    }, 0)
}

/**
 * Fetch all active staff members and compute hours + clock-out notes for
 * the half-open interval [startIso, endIso).
 */
export async function getStaffHoursSummary(
  client: SanityClient,
  startIso: string,
  endIso: string,
): Promise<StaffSummaryRow[]> {
  const startMs = new Date(startIso).getTime()
  const endMs = new Date(endIso).getTime()
  const expectedHours = expectedHoursForPeriod(startMs, endMs)

  const [allStaff, logs]: [Array<{ _id: string; fullName: string }>, HoursLogEntry[]] =
    await Promise.all([
      client.fetch(
        `*[_type == "staffMember" && active == true] | order(fullName asc){ _id, fullName }`,
        {},
      ),
      client.fetch(
        `*[_type == "hoursLog" && clockIn >= $start && clockIn < $end]{
          clockIn, clockOut, notes,
          "staffId": staffMember._ref
        }`,
        { start: startIso, end: endIso },
      ),
    ])

  return allStaff.map(member => {
    const hours = hoursInRange(logs, member._id, startMs, endMs)
    const flagged = hours > 0 && hours < expectedHours * 0.9

    const noteEntries = logs
      .filter(l => l.staffId === member._id && !!l.notes)
      .sort((a, b) => new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime())
      .map(l => ({
        date: new Date(l.clockIn).toLocaleDateString('en-CA', {
          weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
        }),
        text: l.notes as string,
      }))

    return { _id: member._id, fullName: member.fullName, hours, expectedHours, flagged, noteEntries }
  })
}
