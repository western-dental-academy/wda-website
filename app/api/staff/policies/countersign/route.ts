import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getStaffByClerkId, policyClient } from '@/lib/staff/policies'

// POST { ackId } — an owner records the management countersignature on a signed acknowledgement.
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

  const viewer = await getStaffByClerkId(userId)
  if (!viewer || viewer.role !== 'owner') return NextResponse.json({ error: 'Owners only.' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const ackId = typeof body?.ackId === 'string' ? body.ackId : ''
  if (!ackId) return NextResponse.json({ error: 'Missing acknowledgement.' }, { status: 400 })

  const ack = await policyClient.fetch(
    `*[_type == "policyAcknowledgement" && _id == $id][0]{ _id, countersignedBy, countersignedAt, "staffId": staffMember._ref }`,
    { id: ackId },
  )
  if (!ack) return NextResponse.json({ error: 'Acknowledgement not found.' }, { status: 404 })
  if (ack.countersignedAt) return NextResponse.json({ ok: true, countersignedBy: ack.countersignedBy, countersignedAt: ack.countersignedAt })
  if (ack.staffId === viewer._id) {
    return NextResponse.json({ error: 'Another owner needs to countersign your own acknowledgement.' }, { status: 400 })
  }

  const countersignedAt = new Date().toISOString()
  const countersignedBy = `${viewer.fullName}${viewer.jobTitle ? `, ${viewer.jobTitle}` : ''}`
  await policyClient.patch(ackId).set({ countersignedBy, countersignedAt }).commit()
  return NextResponse.json({ ok: true, countersignedBy, countersignedAt })
}
