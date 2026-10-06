import { NextRequest } from 'next/server'
import { computeSlots, isDateBookable } from '@/lib/invigilation/settings'
import { getBookingsForDate, getInvigilationSettings } from '@/lib/invigilation/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Invalid date' }, { status: 400 })
  }
  try {
    const settings = await getInvigilationSettings()
    if (!isDateBookable(settings, date)) return Response.json({ date, slots: [] })
    const bookings = await getBookingsForDate(date)
    return Response.json({ date, slots: computeSlots(settings, date, bookings) })
  } catch (error) {
    console.error('Invigilation availability error:', error)
    return Response.json({ error: 'Could not load availability' }, { status: 500 })
  }
}
