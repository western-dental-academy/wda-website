import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { graphClient } from '@/lib/microsoft-graph'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const CALENDAR_EMAIL = 'WDAteamsite@westerndentalacademy.com'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { requestId } = body as { requestId?: string }
  if (!requestId?.trim()) {
    return Response.json({ error: 'requestId is required' }, { status: 400 })
  }

  // Resolve the current user's staffMember doc
  const staff = await client.fetch<{ _id: string } | null>(
    `*[_type == "staffMember" && !(_id in path("drafts.**")) && clerkUserId == $uid && active == true][0]{ _id }`,
    { uid: userId }
  )
  if (!staff) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch the time-off request
  const request = await client.fetch<{
    _id: string
    status: string
    startDate: string
    type: string
    calendarEventId?: string
    staffMember: { _ref: string }
  } | null>(
    `*[_type == "timeOffRequest" && !(_id in path("drafts.**")) && _id == $id][0]{
      _id, status, startDate, type, calendarEventId,
      "staffMember": staffMember{ _ref }
    }`,
    { id: requestId }
  )
  if (!request) return Response.json({ error: 'Request not found' }, { status: 404 })

  // Staff can only cancel their own requests
  if (request.staffMember._ref !== staff._id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Only pending or approved requests can be cancelled
  if (request.status !== 'pending' && request.status !== 'approved') {
    return Response.json({ error: 'Request cannot be cancelled' }, { status: 400 })
  }

  // Cannot cancel time-off that has already started
  const today = new Date().toISOString().split('T')[0]
  if (request.startDate <= today) {
    return Response.json({ error: 'Cannot cancel a request that has already started or passed' }, { status: 400 })
  }

  // Mark as cancelled in Sanity
  await client.patch(requestId).set({ status: 'cancelled' }).commit()

  // Delete the Teams calendar event if one was created (approved requests only)
  if (request.calendarEventId) {
    try {
      await graphClient
        .api(`/users/${CALENDAR_EMAIL}/calendar/events/${request.calendarEventId}`)
        .delete()
    } catch (error) {
      console.error('Failed to delete calendar event:', error)
      // Don't block cancellation if calendar deletion fails
    }
  }

  return Response.json({ success: true })
}
