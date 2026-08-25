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

export async function GET() {
  const result = await getAuthedEmail()
  if (result instanceof NextResponse) return result

  try {
    const tasks = await client.fetch(
      `*[_type == "task"] | order(dueDate asc, createdAt desc){
        _id, title, description, assignedTo, assignedBy,
        dueDate, priority, status, createdAt, completedAt
      }`
    )
    return NextResponse.json(tasks)
  } catch (err) {
    console.error('Task fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const result = await getAuthedEmail()
  if (result instanceof NextResponse) return result
  const { email } = result

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { title, description, assignedTo, dueDate, priority } = body as {
    title?: string
    description?: string
    assignedTo?: string
    dueDate?: string
    priority?: string
  }

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (priority && !(VALID_PRIORITIES as readonly string[]).includes(priority)) {
    return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
  }

  try {
    const doc = {
      _type:       'task' as const,
      title:       title.trim(),
      assignedBy:  email,
      priority:    priority ?? 'Medium',
      status:      'To Do',
      createdAt:   new Date().toISOString(),
      ...(description?.trim() ? { description: description.trim() } : {}),
      ...(assignedTo            ? { assignedTo }                    : {}),
      ...(dueDate               ? { dueDate }                       : {}),
    }

    const created = await client.create(doc)

    // Return the full task shape the component expects
    const task = await client.fetch(
      `*[_id == $id][0]{ _id, title, description, assignedTo, assignedBy, dueDate, priority, status, createdAt, completedAt }`,
      { id: created._id }
    )
    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    console.error('Task create error:', err)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
