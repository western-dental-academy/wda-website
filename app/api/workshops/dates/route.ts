import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function GET() {
  try {
    const now = new Date().toISOString()

    const [dates, paidRegs] = await Promise.all([
      client.fetch<Array<{
        _id: string
        workshop: string
        date: string
        capacity: number
      }>>(
        `*[_type == "workshopDate" && active == true && date > $now] | order(date asc){
          _id, workshop, date, capacity
        }`,
        { now },
      ),
      client.fetch<Array<{ workshopDateId: string }>>(
        `*[_type == "workshopRegistration" && defined(workshopDateId) && stripePaymentStatus == "paid"]{
          workshopDateId
        }`,
        {},
      ),
    ])

    // Count paid registrations per date ID
    const countMap: Record<string, number> = {}
    for (const r of paidRegs) {
      if (r.workshopDateId) {
        countMap[r.workshopDateId] = (countMap[r.workshopDateId] ?? 0) + 1
      }
    }

    const result = dates.map(d => ({
      id: d._id,
      workshop: d.workshop,
      date: d.date,
      capacity: d.capacity,
      registered: countMap[d._id] ?? 0,
      isFull: (countMap[d._id] ?? 0) >= d.capacity,
    }))

    return Response.json(result)
  } catch (error) {
    console.error('Workshop dates error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
