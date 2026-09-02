import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
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

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const user  = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const offerings = await client.fetch(
      `*[_type == "workshopOffering"] | order(title asc){
        _id, title, category, capacity, hasVirtualOption, virtualPrice, price
      }`
    )
    return NextResponse.json(offerings)
  } catch (err) {
    console.error('Workshop offerings fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch offerings' }, { status: 500 })
  }
}
