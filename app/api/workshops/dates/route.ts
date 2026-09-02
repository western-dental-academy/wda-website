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
        date: string
        offering: {
          title: string
          category: string
          capacity: number
          hasVirtualOption?: boolean
          virtualPrice?: number
          price?: number
        } | null
      }>>(
        `*[_type == "workshopDate" && active == true && date > $now] | order(date asc){
          _id, date,
          offering->{ title, category, capacity, hasVirtualOption, virtualPrice, price }
        }`,
        { now },
      ),
      // Only count in-person paid registrations toward capacity
      client.fetch<Array<{ workshopDateId: string; deliveryMethod?: string }>>(
        `*[_type == "workshopRegistration" && defined(workshopDateId) && stripePaymentStatus == "paid"]{
          workshopDateId, deliveryMethod
        }`,
        {},
      ),
    ])

    // Count in-person paid registrations per date ID
    const countMap: Record<string, number> = {}
    for (const r of paidRegs) {
      if (r.workshopDateId && r.deliveryMethod !== 'virtual') {
        countMap[r.workshopDateId] = (countMap[r.workshopDateId] ?? 0) + 1
      }
    }

    const result = dates.map(d => {
      const cap = d.offering?.capacity ?? 20
      const registered = countMap[d._id] ?? 0
      return {
        id: d._id,
        workshop: d.offering?.title ?? '',
        date: d.date,
        capacity: cap,
        category: d.offering?.category ?? 'workshop',
        registered,
        isFull: registered >= cap,
        hasVirtualOption: d.offering?.hasVirtualOption ?? false,
        virtualPrice: d.offering?.virtualPrice ?? null,
      }
    })

    return Response.json(result)
  } catch (error) {
    console.error('Workshop dates error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
