import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  ackDocId,
  blocksToText,
  DEFAULT_ATTESTATION,
  getStaffByClerkId,
  normaliseName,
  policyClient,
  type PolicyQuestion,
} from '@/lib/staff/policies'

// POST { policyId, version, signedName, agreed: true, answers: { [questionKey]: string } }
// Records that the signed-in staff member read and agreed to the current version of a policy.
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

  const staff = await getStaffByClerkId(userId)
  if (!staff) return NextResponse.json({ error: 'Staff record not found.' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const policyId = typeof body?.policyId === 'string' ? body.policyId : ''
  const version = typeof body?.version === 'string' ? body.version : ''
  const signedName = typeof body?.signedName === 'string' ? body.signedName.trim().slice(0, 120) : ''
  const answers: Record<string, unknown> = body?.answers && typeof body.answers === 'object' ? body.answers : {}

  if (!policyId || body?.agreed !== true) {
    return NextResponse.json({ error: 'Please tick the box to confirm you have read and understood the policy.' }, { status: 400 })
  }

  const policy = await policyClient.fetch(
    `*[_type == "policy" && _id == $id && active == true][0]{
      _id, _rev, title, version, body, attestation, questions, "assignedIds": assignedTo[]._ref
    }`,
    { id: policyId },
  )
  if (!policy) return NextResponse.json({ error: 'This policy is no longer available.' }, { status: 404 })
  if (policy.assignedIds?.length && !policy.assignedIds.includes(staff._id)) {
    return NextResponse.json({ error: 'This policy is not assigned to you.' }, { status: 403 })
  }
  if (version !== policy.version) {
    return NextResponse.json({ error: 'This policy was just updated. Please reload the page and read the new version.' }, { status: 409 })
  }
  if (!signedName || normaliseName(signedName) !== normaliseName(staff.fullName)) {
    return NextResponse.json({ error: `Please type your full name exactly as it appears: ${staff.fullName}` }, { status: 400 })
  }

  const questions: PolicyQuestion[] = policy.questions ?? []
  const responses: Array<{ _key: string; question: string; answer: string }> = []
  for (const q of questions) {
    const raw = answers[q._key]
    const answer = typeof raw === 'string' ? raw.trim().slice(0, 2000) : ''
    if (q.required !== false && !answer) {
      return NextResponse.json({ error: `Please answer: ${q.question}` }, { status: 400 })
    }
    if (answer && q.kind !== 'text' && q.options?.length && !q.options.includes(answer)) {
      return NextResponse.json({ error: `Please pick one of the options for: ${q.question}` }, { status: 400 })
    }
    responses.push({ _key: q._key, question: q.question, answer })
  }

  const _id = ackDocId(policy._id, staff._id, policy.version)
  const existing = await policyClient.fetch(`*[_id == $id][0]{ acknowledgedAt }`, { id: _id })
  if (existing) return NextResponse.json({ ok: true, acknowledgedAt: existing.acknowledgedAt, already: true })

  const acknowledgedAt = new Date().toISOString()
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || ''

  await policyClient.create({
    _id,
    _type: 'policyAcknowledgement',
    policy: { _type: 'reference', _ref: policy._id, _weak: true },
    policyTitle: policy.title,
    policyVersion: policy.version,
    policyRevision: policy._rev,
    staffMember: { _type: 'reference', _ref: staff._id, _weak: true },
    staffName: staff.fullName,
    staffEmail: staff.email,
    jobTitle: staff.jobTitle ?? '',
    signedName,
    attestation: policy.attestation?.trim() || DEFAULT_ATTESTATION,
    acknowledgedAt,
    responses,
    contentSnapshot: blocksToText(policy.body),
    ipAddress: ip,
    userAgent: (req.headers.get('user-agent') ?? '').slice(0, 300),
  })

  return NextResponse.json({ ok: true, acknowledgedAt, id: _id })
}
