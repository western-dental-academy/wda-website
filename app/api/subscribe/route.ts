import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { subscribeRatelimit } from '@/lib/ratelimit'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  
  
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await subscribeRatelimit.limit(ip)
  if (!success) {
    return Response.json(
      { error: 'Too many requests. Please try again in a few minutes.' },
      { status: 429 }
    )
  }
  
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Check if already subscribed
    const existing = await client.fetch(
      `*[_type == "subscriber" && email == $email][0]{ _id }`,
      { email }
    )

    if (existing) {
      return Response.json({ success: true, message: 'Already subscribed' })
    }

    await client.create({
      _type: 'subscriber',
      email,
      subscribedAt: new Date().toISOString(),
      source: 'website',
      active: true,
    })

    return Response.json({ success: true, message: 'Subscribed successfully' })
  } catch (error) {
    console.error('Subscribe error:', error)
    return Response.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}