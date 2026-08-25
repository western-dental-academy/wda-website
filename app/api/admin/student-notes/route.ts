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

// POST — add a note
export async function POST(req: NextRequest) {
  const authResult = await getAuthedEmail()
  if (authResult instanceof NextResponse) return authResult
  const { email } = authResult

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { studentId, note, noteKey } = body as {
    studentId?: string
    note?: string
    noteKey?: string
  }

  if (!studentId?.trim()) return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
  if (!note?.trim())       return NextResponse.json({ error: 'note is required' },      { status: 400 })
  if (!noteKey?.trim())    return NextResponse.json({ error: 'noteKey is required' },   { status: 400 })

  try {
    await client
      .patch(studentId)
      .setIfMissing({ staffNotes: [] })
      .append('staffNotes', [{
        _key:    noteKey,
        note:    note.trim(),
        addedBy: email,
        addedAt: new Date().toISOString(),
      }])
      .commit()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Student note add error:', err)
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 })
  }
}

// DELETE — remove a note by _key
export async function DELETE(req: NextRequest) {
  const authResult = await getAuthedEmail()
  if (authResult instanceof NextResponse) return authResult

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { studentId, noteKey } = body as {
    studentId?: string
    noteKey?: string
  }

  if (!studentId?.trim()) return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
  if (!noteKey?.trim())   return NextResponse.json({ error: 'noteKey is required' },   { status: 400 })

  try {
    await client
      .patch(studentId)
      .unset([`staffNotes[_key=="${noteKey}"]`])
      .commit()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Student note delete error:', err)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
