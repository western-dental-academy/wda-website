import { createClient } from '@sanity/client'
import {
  DEFAULT_INVIGILATION_SETTINGS,
  HOLD_MINUTES,
  type ExistingBooking,
  type InvigilationSettings,
} from './settings'

export const invigilationClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function getInvigilationSettings(): Promise<InvigilationSettings> {
  const doc = await invigilationClient.fetch<Partial<InvigilationSettings> | null>(
    `*[_type == "invigilationSettings" && _id == "invigilationSettings" && !(_id in path("drafts.**"))][0]{
      bookingsOpen, sessionPrice, verbalReaderPrice, maxStudentsPerHour, minDaysNotice, maxDaysAhead,
      "weeklyHours": weeklyHours[]{ day, open, close },
      "closedDates": closedDates[]{ date, reason }
    }`,
  )
  const d = DEFAULT_INVIGILATION_SETTINGS
  return {
    bookingsOpen: doc?.bookingsOpen ?? d.bookingsOpen,
    sessionPrice: doc?.sessionPrice ?? d.sessionPrice,
    verbalReaderPrice: doc?.verbalReaderPrice ?? d.verbalReaderPrice,
    maxStudentsPerHour: doc?.maxStudentsPerHour ?? d.maxStudentsPerHour,
    minDaysNotice: doc?.minDaysNotice ?? d.minDaysNotice,
    maxDaysAhead: doc?.maxDaysAhead ?? d.maxDaysAhead,
    weeklyHours: doc?.weeklyHours ?? d.weeklyHours,
    closedDates: doc?.closedDates ?? d.closedDates,
  }
}

// Paid bookings, plus unpaid ones still inside their checkout hold window,
// so two students can't both grab the last seat while paying.
export async function getBookingsForDate(date: string): Promise<ExistingBooking[]> {
  const holdCutoff = new Date(Date.now() - (HOLD_MINUTES + 5) * 60 * 1000).toISOString()
  const rows = await invigilationClient.fetch<{ startTime: string; durationHours: number; accommodations?: string[] }[]>(
    `*[_type == "invigilationBooking" && !(_id in path("drafts.**")) && date == $date && status != "cancelled"
      && (stripePaymentStatus == "paid" || (stripePaymentStatus == "unpaid" && bookedAt > $holdCutoff))]{
      startTime, durationHours, accommodations
    }`,
    { date, holdCutoff },
  )
  return rows.map(r => ({
    startTime: r.startTime,
    durationHours: r.durationHours,
    exclusive: (r.accommodations?.length ?? 0) > 0,
  }))
}
