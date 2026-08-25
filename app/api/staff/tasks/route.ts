import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const STAFF_NAMES: Record<string, string> = {
  'aiden@westerndentalacademy.com':    'Aiden',
  'jolene@westerndentalacademy.com':   'Jolene',
  'alana@westerndentalacademy.com':    'Alana',
  'collette@westerndentalacademy.com': 'Collette',
  'tammy@westerndentalacademy.com':    'Tammy',
  'lance@westerndentalacademy.com':    'Lance',
  'ryan@westerndentalacademy.com':     'Ryan',
}

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

    // Notify assigned staff member (skip if unassigned or self-assigned)
    if (assignedTo && assignedTo !== email) {
      try {
        await resend.emails.send({
          from: 'Western Dental Academy <info@westerndentalacademy.com>',
          to: assignedTo,
          subject: `New Task Assigned: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1E3560; padding: 32px;">
                <h1 style="color: white; margin: 0; font-size: 22px;">New Task Assigned</h1>
                <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">Western Dental Academy</p>
              </div>
              <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e5e7eb;">
                <p style="color: #1E3560; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Hi ${STAFF_NAMES[assignedTo] ?? assignedTo},</p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                  ${STAFF_NAMES[email] ?? email} has assigned you a new task.
                </p>
                <div style="background-color: #F4F7F9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: #1E3560; font-size: 16px; font-weight: 700; margin: 0 0 8px;">${title}</p>
                  ${description?.trim() ? `<p style="color: #4b5563; font-size: 14px; margin: 0 0 12px;">${description.trim()}</p>` : ''}
                  <table style="width: 100%; font-size: 13px;">
                    ${dueDate ? `<tr><td style="color: #6b7280; padding: 4px 0;">Due Date</td><td style="color: #1E3560; font-weight: 600;">${new Date(dueDate).toLocaleDateString('en-CA', { timeZone: 'America/Edmonton', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>` : ''}
                    <tr><td style="color: #6b7280; padding: 4px 0;">Priority</td><td style="color: #1E3560; font-weight: 600;">${priority ?? 'Medium'}</td></tr>
                  </table>
                </div>
                <a href="https://westerndentalacademy.com/admin"
                   style="background-color: #E67E22; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                  View Task in Dashboard
                </a>
              </div>
              <div style="padding: 16px 32px; background-color: #F4F7F9; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">Western Dental Academy — westerndentalacademy.com</p>
              </div>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('Task assignment email failed:', emailErr)
      }
    }

    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    console.error('Task create error:', err)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
