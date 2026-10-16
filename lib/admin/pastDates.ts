// Alberta abolished DST, so WDA local time is UTC-6 year-round.
// Never use "America/Edmonton" here — Node tz data still applies the old DST rule.
const ALBERTA_OFFSET_MS = 6 * 60 * 60 * 1000

// YYYY-MM-DD calendar day in Alberta for a given instant
export function albertaDay(value: string | Date): string {
  return new Date(new Date(value).getTime() - ALBERTA_OFFSET_MS).toISOString().slice(0, 10)
}

// True once the Alberta calendar day of `iso` is over — an event stays
// visible for the whole of its own day so staff can still check people in.
export function isPastDay(iso?: string | null): boolean {
  if (!iso) return false
  return albertaDay(iso) < albertaDay(new Date())
}
