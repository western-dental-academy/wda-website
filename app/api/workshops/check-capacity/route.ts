import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function GET(req: NextRequest) {
  const workshopDateId = req.nextUrl.searchParams.get('workshopDateId')
  if (!workshopDateId) {
    return Response.json({ error: 'workshopDateId is required' }, { status: 400 })
  }

  try {
    const [dateDoc, registeredCount] = await Promise.all([
      client.fetch<{ capacity: number } | null>(
        `*[_type == "workshopDate" && _id == "${workshopDateId}"][0]{ capacity }`,
      ),
      client.fetch<number>(
        `count(*[_type == "workshopRegistration" && workshopDateId == "${workshopDateId}" && stripePaymentStatus == "paid"])`,
      ),
    ])

    const capacity = dateDoc?.capacity ?? 20
    const registered = registeredCount
    const available = Math.max(0, capacity - registered)

    return Response.json({ capacity, registered, available })
  } catch (error) {
    console.error('check-capacity error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
