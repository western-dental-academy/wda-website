import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

const VALID_TYPES = ['info', 'important', 'reminder', 'success'] as const

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function checkAdmin(): Promise<NextResponse | null> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return null
}

export async function GET() {
  const denied = await checkAdmin()
  if (denied) return denied

  const announcements = await client.fetch(
    `*[_type == "announcement" && active == true] | order(publishedAt desc){
      _id, title, message, type, publishedAt, expiresAt,
      program->{ _id, title }
    }`
  )
  return NextResponse.json({ announcements })
}

export async function POST(req: NextRequest) {
  const denied = await checkAdmin()
  if (denied) return denied

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { title, message, type, programId, expiresAt } = body as {
    title?: string; message?: string; type?: string; programId?: string; expiresAt?: string
  }

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

  const resolvedType = (VALID_TYPES as readonly string[]).includes(type ?? '') ? type! : 'info'

  const doc: Record<string, unknown> = {
    _type: 'announcement',
    title: title.trim(),
    message: message.trim(),
    type: resolvedType,
    active: true,
    publishedAt: new Date().toISOString(),
  }

  if (programId) doc.program = { _type: 'reference', _ref: programId }
  if (expiresAt) doc.expiresAt = new Date(expiresAt).toISOString()

  let created: Awaited<ReturnType<typeof client.create>>
  try {
    created = await client.create(doc as { _type: string; [key: string]: unknown })
  } catch (err) {
    console.error('Sanity announcement create error:', err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }

  const programFilter = programId
    ? `&& program._ref == "${programId}"`
    : ''

  const students = await client.fetch<{ firstName: string; email: string }[]>(
    `*[_type == "student" && (status == "accepted" || status == "enrolled") ${programFilter}]{
      firstName, email
    }`
  )

  const results = await Promise.allSettled(
    students.map((student) =>
      resend.emails.send({
        from: 'Western Dental Academy <info@westerndentalacademy.com>',
        to: student.email,
        subject: `WDA Announcement: ${title!.trim()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1E3560; padding: 32px;">
              <h1 style="color: white; margin: 0; font-size: 22px;">Western Dental Academy</h1>
              <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">Announcement</p>
            </div>
            <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e5e7eb;">
              <p style="color: #1E3560; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Hi ${student.firstName},</p>
              <h2 style="color: #1E3560; font-size: 18px; margin-bottom: 12px;">${title!.trim()}</h2>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">${message!.trim()}</p>
              <a href="https://westerndentalacademy.com/portal"
                 style="background-color: #E67E22; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                View in Student Portal
              </a>
            </div>
            <div style="padding: 16px 32px; background-color: #F4F7F9; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Western Dental Academy — westerndentalacademy.com</p>
            </div>
          </div>
        `,
      })
    )
  )

  return NextResponse.json({
    announcement: created,
    emailsSent: results.filter((r) => r.status === 'fulfilled').length,
    emailsFailed: results.filter((r) => r.status === 'rejected').length,
  })
}

export async function PATCH(req: NextRequest) {
  const denied = await checkAdmin()
  if (denied) return denied

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { id } = body as { id?: string }
  if (!id || typeof id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    await client.patch(id).set({ active: false }).commit()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Sanity announcement deactivate error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
