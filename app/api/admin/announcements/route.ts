import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'aiden2@westerndentalacademy.com',
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

  try {
    const created = await client.create(doc as { _type: string; [key: string]: unknown })
    return NextResponse.json({ announcement: created })
  } catch (err) {
    console.error('Sanity announcement create error:', err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
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
