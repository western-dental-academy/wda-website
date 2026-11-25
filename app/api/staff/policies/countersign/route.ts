import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getPolicyManager, policyClient } from '@/lib/staff/policies'

// POST { ackId } — a policy manager (WDA Hub → Policies) records the management countersignature.
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

  const manager = await getPolicyManager()
  if (!manager) return NextResponse.json({ error: 'Only policy managers can countersign.' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const ackId = typeof body?.ackId === 'string' ? body.ackId : ''
  if (!ackId) return NextResponse.json({ error: 'Missing acknowledgement.' }, { status: 400 })

  const ack = await policyClient.fetch(
    `*[_type == "policyAcknowledgement" && _id == $id][0]{ _id, countersignedBy, countersignedAt, staffEmail }`,
    { id: ackId },
  )
  if (!ack) return NextResponse.json({ error: 'Acknowledgement not found.' }, { status: 404 })
  if (ack.countersignedAt) return NextResponse.json({ ok: true, countersignedBy: ack.countersignedBy, countersignedAt: ack.countersignedAt })
  if (ack.staffEmail?.toLowerCase() === manager.email) {
    return NextResponse.json({ error: 'Another manager needs to countersign your own acknowledgement.' }, { status: 400 })
  }

  const countersignedAt = new Date().toISOString()
  await policyClient.patch(ackId).set({ countersignedBy: manager.name, countersignedAt }).commit()
  return NextResponse.json({ ok: true, countersignedBy: manager.name, countersignedAt })
}
