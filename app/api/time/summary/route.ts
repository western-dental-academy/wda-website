import { auth } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

function getWeekStart(offsetWeeks = 0): number {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff - offsetWeeks * 7)
  monday.setHours(0, 0, 0, 0)
  return monday.getTime()
}

function hoursInRange(
  logs: Array<{ staffId: string; clockIn: string; clockOut: string | null }>,
  staffId: string,
  rangeStart: number,
  rangeEnd: number
): number {
  return logs
    .filter(l => l.staffId === staffId)
    .filter(l => {
      const ci = new Date(l.clockIn).getTime()
      return ci >= rangeStart && ci < rangeEnd
    })
    .reduce((sum, l) => {
      const s = new Date(l.clockIn).getTime()
      const e = l.clockOut ? new Date(l.clockOut).getTime() : Date.now()
      return sum + Math.max(0, e - s) / 3_600_000
    }, 0)
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const decider = await client.fetch(
    `*[_type == "staffMember" && clerkUserId == $uid && active == true][0]{ _id, role }`,
    { uid: userId }
  )
  if (!decider || decider.role !== 'owner') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const fiveWeeksAgo = new Date(getWeekStart(5)).toISOString()

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const monthEnd = new Date(nextMonth.getTime() - 1).toISOString().slice(0, 10)

  const [allStaff, allLogs, pendingRequests, approvedThisMonth] = await Promise.all([
    client.fetch(
      `*[_type == "staffMember" && active == true] | order(fullName asc){ _id, fullName }`,
      {}
    ),
    client.fetch(
      `*[_type == "hoursLog" && clockIn >= $since]{ clockIn, clockOut, "staffId": staffMember._ref }`,
      { since: fiveWeeksAgo }
    ),
    client.fetch(
      `*[_type == "timeOffRequest" && status == "pending"] | order(submittedAt asc){
        _id, type, startDate, endDate, halfDay, reason, submittedAt,
        staffMember->{ _id, fullName, email }
      }`,
      {}
    ),
    client.fetch(
      `*[_type == "timeOffRequest" && status == "approved" && startDate <= $monthEnd && endDate >= $monthStart]{
        _id, type, startDate, endDate,
        staffMember->{ _id, fullName }
      }`,
      { monthStart, monthEnd }
    ),
  ])

  const w0start = getWeekStart(0)
  const w1start = getWeekStart(1)
  const w2start = getWeekStart(2)
  const w3start = getWeekStart(3)
  const w4start = getWeekStart(4)
  const now_ts = Date.now()

  const staff = allStaff.map((member: any) => {
    const thisWeek  = hoursInRange(allLogs, member._id, w0start, now_ts)
    const lastWeek  = hoursInRange(allLogs, member._id, w1start, w0start)
    const week2     = hoursInRange(allLogs, member._id, w2start, w1start)
    const week3     = hoursInRange(allLogs, member._id, w3start, w2start)
    const week4     = hoursInRange(allLogs, member._id, w4start, w3start)
    const fourWeekAvg = (lastWeek + week2 + week3 + week4) / 4
    const pending = pendingRequests.filter((r: any) => r.staffMember._id === member._id).length

    return {
      _id: member._id,
      fullName: member.fullName,
      thisWeekHours: thisWeek,
      lastWeekHours: lastWeek,
      fourWeekAvgHours: fourWeekAvg,
      pendingRequests: pending,
    }
  })

  return Response.json({ staff, pendingRequests, approvedThisMonth })
}
