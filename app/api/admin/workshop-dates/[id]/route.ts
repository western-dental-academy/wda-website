import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'lance@westerndentalacademy.com',
  'ryan@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function getAuthedEmail(): Promise<{ email: string } | NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const user  = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return { email }
}

// PATCH — update workshop, date, capacity, or active
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await getAuthedEmail()
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { workshop, date, capacity, active, category } = body as {
    workshop?: string
    date?: string
    capacity?: number
    active?: boolean
    category?: string
  }

  const patch: Record<string, unknown> = {}
  if (workshop !== undefined) patch.workshop = workshop
  if (date     !== undefined) patch.date     = date
  if (capacity !== undefined) patch.capacity = Number(capacity)
  if (active   !== undefined) patch.active   = active
  if (category !== undefined) patch.category = category

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  try {
    await client.patch(id).set(patch).commit()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Workshop date patch error:', err)
    return NextResponse.json({ error: 'Failed to update workshop date' }, { status: 500 })
  }
}

// DELETE — soft delete: set active: false
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await getAuthedEmail()
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    await client.patch(id).set({ active: false }).commit()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Workshop date deactivate error:', err)
    return NextResponse.json({ error: 'Failed to deactivate workshop date' }, { status: 500 })
  }
}
