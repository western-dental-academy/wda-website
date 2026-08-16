import { auth } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}

function computeHours(logs: Array<{ clockIn: string; clockOut: string | null }>): number {
  const now = Date.now()
  return logs.reduce((sum, log) => {
    const start = new Date(log.clockIn).getTime()
    const end = log.clockOut ? new Date(log.clockOut).getTime() : now
    return sum + Math.max(0, end - start) / 3_600_000
  }, 0)
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const staff = await client.fetch(
    `*[_type == "staffMember" && clerkUserId == $uid && active == true][0]{ _id }`,
    { uid: userId }
  )
  if (!staff) return Response.json({ error: 'Staff member not found' }, { status: 404 })

  const [active, weekLogs] = await Promise.all([
    client.fetch(
      `*[_type == "hoursLog" && staffMember._ref == $id && !defined(clockOut)] | order(clockIn desc)[0]{ _id, clockIn }`,
      { id: staff._id }
    ),
    client.fetch(
      `*[_type == "hoursLog" && staffMember._ref == $id && clockIn >= $start && defined(clockOut)]{ clockIn, clockOut }`,
      { id: staff._id, start: getWeekStart() }
    ),
  ])

  return Response.json({ active: active ?? null, weekHours: computeHours(weekLogs) })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const staff = await client.fetch(
    `*[_type == "staffMember" && clerkUserId == $uid && active == true][0]{ _id }`,
    { uid: userId }
  )
  if (!staff) return Response.json({ error: 'Staff member not found' }, { status: 404 })

  const active = await client.fetch(
    `*[_type == "hoursLog" && staffMember._ref == $id && !defined(clockOut)] | order(clockIn desc)[0]{ _id, clockIn }`,
    { id: staff._id }
  )

  if (active) {
    const updated = await client
      .patch(active._id)
      .set({ clockOut: new Date().toISOString() })
      .commit()
    return Response.json({ action: 'clocked-out', entry: updated })
  } else {
    const entry = await client.create({
      _type: 'hoursLog',
      staffMember: { _type: 'reference', _ref: staff._id },
      clockIn: new Date().toISOString(),
    })
    return Response.json({ action: 'clocked-in', entry })
  }
}
