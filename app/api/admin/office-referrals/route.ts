import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'

// Only Aiden manages the office outreach contest; other staff see the read-only leaderboard on /staff
const OUTREACH_MANAGERS = ['aiden@westerndentalacademy.com']

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const REGISTRATION_TYPES = ['workshopRegistration', 'courseEnrollment']

// Assign (or clear) the dental office on a workshop registration or course enrollment
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!OUTREACH_MANAGERS.includes(email)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { registrationId, officeId, source } = body as {
    registrationId?: string
    officeId?: string | null
    source?: 'matched' | 'manual' | 'none'
  }
  if (!registrationId?.trim()) {
    return Response.json({ error: 'registrationId is required' }, { status: 400 })
  }

  try {
    const reg = await client.fetch<{ _type: string } | null>(
      `*[_id == $id && !(_id in path("drafts.**"))][0]{ _type }`,
      { id: registrationId },
    )
    if (!reg || !REGISTRATION_TYPES.includes(reg._type)) {
      return Response.json({ error: 'Registration not found' }, { status: 404 })
    }

    // No office: either clear the assignment, or mark as reviewed with no office (source 'none')
    if (!officeId) {
      const patch = client.patch(registrationId).unset(['office'])
      if (source === 'none') patch.set({ officeSource: 'none', officeAssignedBy: email })
      else patch.unset(['officeSource', 'officeAssignedBy'])
      await patch.commit()
      return Response.json({ ok: true })
    }

    const office = await client.fetch<{ _id: string } | null>(
      `*[_type == "dentalOffice" && _id == $id && !(_id in path("drafts.**"))][0]{ _id }`,
      { id: officeId },
    )
    if (!office) return Response.json({ error: 'Office not found' }, { status: 404 })

    await client.patch(registrationId).set({
      office: { _type: 'reference', _ref: office._id },
      officeSource: source === 'matched' ? 'matched' : 'manual',
      officeAssignedBy: email,
    }).commit()

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Office referral update error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
