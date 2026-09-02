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

export async function GET() {
  const result = await getAuthedEmail()
  if (result instanceof NextResponse) return result

  try {
    const dates = await client.fetch(
      `*[_type == "workshopDate"] | order(date asc){
        _id, date, active,
        offering->{ _id, title, category, capacity, hasVirtualOption, virtualPrice, price }
      }`
    )
    return NextResponse.json(dates)
  } catch (err) {
    console.error('Workshop dates fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch workshop dates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const result = await getAuthedEmail()
  if (result instanceof NextResponse) return result

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { offeringId, date, active } = body as {
    offeringId?: string
    date?: string
    active?: boolean
  }

  if (!offeringId?.trim()) return NextResponse.json({ error: 'offeringId is required' }, { status: 400 })
  if (!date?.trim())       return NextResponse.json({ error: 'date is required' },       { status: 400 })

  try {
    const created = await client.create({
      _type:    'workshopDate',
      offering: { _type: 'reference', _ref: offeringId.trim() },
      date:     date.trim(),
      active:   active ?? false,
    })

    const doc = await client.fetch(
      `*[_id == "${created._id}"][0]{
        _id, date, active,
        offering->{ _id, title, category, capacity, hasVirtualOption, virtualPrice, price }
      }`
    )
    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    console.error('Workshop date create error:', err)
    return NextResponse.json({ error: 'Failed to create workshop date' }, { status: 500 })
  }
}
