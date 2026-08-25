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

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const
const VALID_STATUSES   = ['To Do', 'In Progress', 'Complete'] as const

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await getAuthedEmail()
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing task id' }, { status: 400 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status, assignedTo, dueDate, priority, completedAt } = body as {
    status?:      string
    assignedTo?:  string
    dueDate?:     string
    priority?:    string
    completedAt?: string
  }

  if (status && !(VALID_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  if (priority && !(VALID_PRIORITIES as readonly string[]).includes(priority)) {
    return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}
  if (status !== undefined)      patch.status      = status
  if (assignedTo !== undefined)  patch.assignedTo  = assignedTo
  if (dueDate !== undefined)     patch.dueDate     = dueDate
  if (priority !== undefined)    patch.priority    = priority
  if (completedAt !== undefined) patch.completedAt = completedAt

  // Auto-set completedAt when marking complete
  if (status === 'Complete' && !completedAt) {
    patch.completedAt = new Date().toISOString()
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  try {
    await client.patch(id).set(patch).commit()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Task patch error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await getAuthedEmail()
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing task id' }, { status: 400 })

  try {
    await client.delete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Task delete error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
