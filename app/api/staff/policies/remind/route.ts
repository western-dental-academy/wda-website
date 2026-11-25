import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getPolicyManager, sendPolicyEmails } from '@/lib/staff/policies'

// POST — a policy manager emails everyone with outstanding policies right now (WDA Hub "Email reminders now").
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  if (!(await getPolicyManager())) return NextResponse.json({ error: 'Only policy managers can send reminders.' }, { status: 403 })

  // Announce anything new first (marks it announced), then remind everyone else who is outstanding
  const result = await sendPolicyEmails({ newPolicies: true, reminders: true })
  return NextResponse.json({
    ok: true,
    sent: result.newPolicyEmails.length + result.reminderEmails.length,
    errors: result.errors,
  })
}
