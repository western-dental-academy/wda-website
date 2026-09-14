import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const resend = new Resend(process.env.RESEND_API_KEY)

const AIDEN_ID    = 'cp9fr4Q1a0eVs1RWEajVfI'
const AIDEN_EMAIL = 'aiden@westerndentalacademy.com'

interface HoursEntry {
  clockIn: string
  clockOut: string
  notes: string | null
}

interface DayGroup {
  label: string      // e.g. "Monday, September 8"
  dateKey: string    // YYYY-MM-DD in Edmonton TZ
  entries: Array<{ notes: string; hours: number }>
  dayHours: number
}

function toEdmontonDateKey(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function toEdmontonDayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function roundHours(ms: number): number {
  return Math.round((ms / 3_600_000) * 100) / 100
}

// Monday of the current local week (Edmonton)
function getWeekBounds() {
  const now = new Date()
  // Edmonton offset: UTC-6 (MST) or UTC-7 (MDT). Use toLocaleDateString to find today's date in Edmonton.
  const todayEdmonton = new Date(now.toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }))
  const dow = todayEdmonton.getDay() // 0=Sun … 6=Sat
  const daysFromMonday = dow === 0 ? 6 : dow - 1
  const monday = new Date(todayEdmonton)
  monday.setDate(todayEdmonton.getDate() - daysFromMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt = (d: Date) => d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtLong = (d: Date) => d.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return {
    mondayLabel: fmt(monday),
    mondayLong: fmtLong(monday),
    sundayLabel: fmt(sunday),
    rangeLabel: `Week of ${fmt(monday)} — ${fmt(sunday)}`,
  }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.WEEKLY_SUMMARY_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Past 7 days from now
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const entries: HoursEntry[] = await client.fetch(
      `*[_type == "hoursLog"
        && !(_id in path("drafts.**"))
        && staffMember._ref == $staffId
        && defined(clockOut)
        && clockOut != null
        && clockOut > $since
       ] | order(clockIn asc) {
         clockIn,
         clockOut,
         notes
       }`,
      { staffId: AIDEN_ID, since: sevenDaysAgo }
    )

    // Group by Edmonton calendar day
    const dayMap = new Map<string, DayGroup>()
    for (const entry of entries) {
      const dateKey = toEdmontonDateKey(entry.clockIn)
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, {
          label: toEdmontonDayLabel(entry.clockIn),
          dateKey,
          entries: [],
          dayHours: 0,
        })
      }
      const hrs = roundHours(new Date(entry.clockOut).getTime() - new Date(entry.clockIn).getTime())
      const group = dayMap.get(dateKey)!
      group.entries.push({ notes: entry.notes ?? '(no notes)', hours: hrs })
      group.dayHours = Math.round((group.dayHours + hrs) * 100) / 100
    }

    const days = Array.from(dayMap.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    const totalSessions = entries.length
    const totalHours = Math.round(days.reduce((s, d) => s + d.dayHours, 0) * 100) / 100

    const { mondayLong, rangeLabel } = getWeekBounds()

    // ── Build HTML ─────────────────────────────────────────────────────────────

    const dayRows = days.length > 0
      ? days.map(day => `
          <div style="margin-bottom:24px;">
            <p style="font-size:14px;font-weight:700;color:#0D3B6E;margin:0 0 10px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">
              ${day.label}
            </p>
            <ul style="margin:0;padding-left:18px;">
              ${day.entries.map(e => `
                <li style="margin-bottom:6px;">
                  <span style="font-size:13px;color:#2B303A;line-height:1.5;">${e.notes}</span>
                  <span style="font-size:11px;color:#9ca3af;margin-left:8px;">${e.hours} hrs</span>
                </li>`).join('')}
            </ul>
            <p style="font-size:12px;color:rgba(13,59,110,0.45);margin:8px 0 0;">
              Day total: ${day.dayHours} hrs
            </p>
          </div>`)
        .join('')
      : `<p style="font-size:13px;color:rgba(43,48,58,0.45);font-style:italic;">No clock-out notes were recorded this week.</p>`

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">

        <!-- Header -->
        <div style="background-color:#0D3B6E;padding:28px 32px;">
          <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Weekly Work Summary</h1>
          <p style="color:rgba(255,255,255,0.55);margin:6px 0 0;font-size:13px;">${rangeLabel} &nbsp;·&nbsp; Western Dental Academy</p>
        </div>

        <!-- Amber stripe -->
        <div style="height:4px;background-color:#E67E22;"></div>

        <!-- Body -->
        <div style="padding:28px 32px;background:#ffffff;border:1px solid #e5e7eb;">

          ${dayRows}

          <!-- Summary -->
          <div style="margin-top:28px;padding:16px 20px;background:#F4F7F9;border-radius:8px;border-left:4px solid #0D3B6E;">
            <p style="margin:0 0 6px;font-size:13px;color:#2B303A;">
              <strong style="color:#0D3B6E;">Total sessions this week:</strong> ${totalSessions}
            </p>
            <p style="margin:0;font-size:13px;color:#2B303A;">
              <strong style="color:#0D3B6E;">Total hours this week:</strong> ${totalHours} hrs
            </p>
          </div>

          <p style="margin-top:24px;font-size:14px;color:#2B303A;">Have a great meeting! 🎯</p>
        </div>

        <!-- Footer -->
        <div style="padding:14px 32px;background:#F4F7F9;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">
            Western Dental Academy — westerndentalacademy.com
          </p>
        </div>

      </div>`

    await resend.emails.send({
      from: 'WDA Platform <noreply@westerndentalacademy.com>',
      to: AIDEN_EMAIL,
      subject: `WDA Weekly Work Summary — Week of ${mondayLong}`,
      html,
    })

    return Response.json({ success: true, entriesFound: totalSessions, emailSent: true })
  } catch (error) {
    console.error('Weekly summary error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
