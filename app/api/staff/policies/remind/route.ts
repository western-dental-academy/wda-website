import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getStaffByClerkId, sendPolicyEmails } from '@/lib/staff/policies'

// POST — an owner emails everyone with outstanding policies right now (the "Email reminders now" button).
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

  const viewer = await getStaffByClerkId(userId)
  if (!viewer || viewer.role !== 'owner') return NextResponse.json({ error: 'Owners only.' }, { status: 403 })

  // Announce anything new first (marks it announced), then remind everyone else who is outstanding
  const result = await sendPolicyEmails({ newPolicies: true, reminders: true })
  return NextResponse.json({
    ok: true,
    sent: result.newPolicyEmails.length + result.reminderEmails.length,
    errors: result.errors,
  })
}
