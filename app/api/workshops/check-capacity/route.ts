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
  const deliveryMethod = req.nextUrl.searchParams.get('deliveryMethod')

  if (!workshopDateId) {
    return Response.json({ error: 'workshopDateId is required' }, { status: 400 })
  }

  // Virtual attendance has unlimited capacity
  if (deliveryMethod === 'virtual') {
    return Response.json({ capacity: null, registered: 0, available: null, unlimited: true })
  }

  try {
    const [dateDoc, registeredCount] = await Promise.all([
      client.fetch<{ capacity: number } | null>(
        `*[_type == "workshopDate" && _id == "${workshopDateId}"][0]{ "capacity": offering->capacity }`,
      ),
      // Count only in-person paid registrations
      client.fetch<number>(
        `count(*[_type == "workshopRegistration" && workshopDateId == "${workshopDateId}" && stripePaymentStatus == "paid" && (deliveryMethod == "in-person" || !defined(deliveryMethod))])`,
      ),
    ])

    const capacity = dateDoc?.capacity ?? 20
    const registered = registeredCount
    const available = Math.max(0, capacity - registered)

    return Response.json({ capacity, registered, available, unlimited: false })
  } catch (error) {
    console.error('check-capacity error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
