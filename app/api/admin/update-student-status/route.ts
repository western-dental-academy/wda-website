import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

const VALID_STATUSES = ['pending', 'accepted', 'rejected', 'enrolled', 'withdrawn'] as const
type StudentStatus = typeof VALID_STATUSES[number]

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  // Auth check
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Admin whitelist check
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { studentId, status } = body as { studentId?: string; status?: string }

  if (!studentId || typeof studentId !== 'string') {
    return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
  }

  if (!status || !(VALID_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Build the patch — set acceptedDate automatically when accepting
  const patch: Record<string, string> = { status: status as StudentStatus }
  if (status === 'accepted') {
    patch.acceptedDate = new Date().toISOString()
  }

  try {
    await client.patch(studentId).set(patch).commit()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Sanity student status update error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
