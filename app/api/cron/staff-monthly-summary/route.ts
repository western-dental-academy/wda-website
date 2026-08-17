import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { getStaffHoursSummary } from '@/lib/staff/hours'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const resend = new Resend(process.env.RESEND_API_KEY)

function fmtH(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0 && m === 0) return '0h'
  if (m === 0) return `${h}h`
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

const TYPE_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ── Date range: first of previous month → first of this month (UTC) ──────
    const now = new Date()
    const y = now.getUTCFullYear()
    const m = now.getUTCMonth() // 0-indexed; cron fires on 1st so this is the current month

    const prevY = m === 0 ? y - 1 : y
    const prevM = m === 0 ? 11 : m - 1

    const startIso = new Date(Date.UTC(prevY, prevM, 1)).toISOString()
    const endIso   = new Date(Date.UTC(y, m, 1)).toISOString()

    // Human-readable month label: "August 2026"
    const monthLabel = new Date(Date.UTC(prevY, prevM, 15)).toLocaleDateString('en-CA', {
      month: 'long', year: 'numeric', timeZone: 'UTC',
    })

    // Date strings for GROQ time-off queries (Sanity date fields are YYYY-MM-DD)
    const periodStart = startIso.slice(0, 10)
    const periodEnd   = new Date(new Date(endIso).getTime() - 1).toISOString().slice(0, 10)

    // ── Fetch data ────────────────────────────────────────────────────────────
    const [staffSummary, owners, approvedTimeOff, pendingRequests] = await Promise.all([
      getStaffHoursSummary(client, startIso, endIso),
      client.fetch(
        `*[_type == "staffMember" && active == true && role == "owner"]{ _id, fullName, email }`,
        {},
      ),
      client.fetch(
        `*[_type == "timeOffRequest" && status == "approved" && startDate <= $end && endDate >= $start] | order(startDate asc){
          type, startDate, endDate, halfDay,
          staffMember->{ fullName }
        }`,
        { start: periodStart, end: periodEnd },
      ),
      client.fetch(
        `*[_type == "timeOffRequest" && status == "pending"] | order(submittedAt asc){
          type, startDate, endDate, halfDay, reason,
          staffMember->{ fullName }
        }`,
        {},
      ),
    ])

    if (!owners || owners.length === 0) {
      return Response.json({ message: 'No owners found — no emails sent' })
    }

    // ── Build email HTML ──────────────────────────────────────────────────────
    const hoursRows = staffSummary.map(row => {
      const flag = row.flagged
        ? `<td style="padding:10px 8px;font-size:12px;color:#c2681f;">&#9888; Under expected</td>`
        : `<td style="padding:10px 8px;font-size:12px;color:#16a34a;">&#10003; On track</td>`
      return `
        <tr style="border-bottom:1px solid #f3f4f6;${row.flagged ? 'border-left:3px solid #E67E22;' : ''}">
          <td style="padding:10px 8px;color:#0D3B6E;font-weight:600;font-size:13px;${row.flagged ? 'padding-left:5px;' : ''}">${row.fullName}</td>
          <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:600;color:${row.flagged ? '#c2681f' : '#2B303A'};">${fmtH(row.hours)}</td>
          <td style="padding:10px 8px;text-align:right;font-size:13px;color:rgba(43,48,58,0.45);">${fmtH(row.expectedHours)}</td>
          ${flag}
        </tr>`
    }).join('')

    const approvedRows = approvedTimeOff.length > 0
      ? approvedTimeOff.map((r: any) => {
          const dates = r.startDate === r.endDate
            ? r.startDate
            : `${r.startDate} – ${r.endDate}`
          const label = `${TYPE_LABELS[r.type] ?? r.type}${r.halfDay ? ' (half-day)' : ''}`
          return `<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 8px;font-size:13px;color:#0D3B6E;">${r.staffMember?.fullName ?? '—'}</td>
            <td style="padding:8px 8px;font-size:13px;color:#2B303A;">${label}</td>
            <td style="padding:8px 8px;font-size:13px;color:rgba(43,48,58,0.55);">${dates}</td>
          </tr>`
        }).join('')
      : `<tr><td colspan="3" style="padding:10px 8px;font-size:13px;color:rgba(43,48,58,0.4);">None this month</td></tr>`

    const pendingRows = pendingRequests.length > 0
      ? pendingRequests.map((r: any) => {
          const dates = r.startDate === r.endDate
            ? r.startDate
            : `${r.startDate} – ${r.endDate}`
          const label = `${TYPE_LABELS[r.type] ?? r.type}${r.halfDay ? ' (half-day)' : ''}`
          return `<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 8px;font-size:13px;color:#0D3B6E;">${r.staffMember?.fullName ?? '—'}</td>
            <td style="padding:8px 8px;font-size:13px;color:#2B303A;">${label}</td>
            <td style="padding:8px 8px;font-size:13px;color:rgba(43,48,58,0.55);">${dates}</td>
          </tr>`
        }).join('')
      : `<tr><td colspan="3" style="padding:10px 8px;font-size:13px;color:rgba(43,48,58,0.4);">No pending requests</td></tr>`

    const staffWithNotes = staffSummary.filter(r => r.noteEntries.length > 0)
    const notesSection = staffWithNotes.length > 0
      ? `
        <h2 style="color:#0D3B6E;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:28px 0 14px;">Clock-Out Notes</h2>
        ${staffWithNotes.map(row => `
          <div style="margin-bottom:18px;">
            <p style="font-weight:700;color:#0D3B6E;font-size:13px;margin:0 0 8px;">${row.fullName}</p>
            <div style="padding-left:12px;border-left:3px solid rgba(13,59,110,0.15);">
              ${row.noteEntries.map(n => `
                <p style="font-size:12px;color:#4b5563;margin:4px 0;line-height:1.5;">
                  <span style="color:rgba(13,59,110,0.4);font-size:11px;">${n.date} —</span> ${n.text}
                </p>`).join('')}
            </div>
          </div>`).join('')}`
      : ''

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;">
        <div style="background-color:#0D3B6E;padding:32px;">
          <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Monthly Staff Hours Summary</h1>
          <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">${monthLabel} &nbsp;·&nbsp; Western Dental Academy</p>
        </div>

        <div style="padding:28px 32px;background:#ffffff;border:1px solid #e5e7eb;">

          <!-- Time off -->
          <h2 style="color:#0D3B6E;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 10px;">Approved Time Off This Month</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <thead><tr style="border-bottom:1px solid #e5e7eb;">
              <th style="text-align:left;padding:6px 8px;font-size:11px;color:rgba(13,59,110,0.45);text-transform:uppercase;">Name</th>
              <th style="text-align:left;padding:6px 8px;font-size:11px;color:rgba(13,59,110,0.45);text-transform:uppercase;">Type</th>
              <th style="text-align:left;padding:6px 8px;font-size:11px;color:rgba(13,59,110,0.45);text-transform:uppercase;">Dates</th>
            </tr></thead>
            <tbody>${approvedRows}</tbody>
          </table>

          <h2 style="color:#0D3B6E;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 10px;">Pending Time-Off Requests</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
            <thead><tr style="border-bottom:1px solid #e5e7eb;">
              <th style="text-align:left;padding:6px 8px;font-size:11px;color:rgba(13,59,110,0.45);text-transform:uppercase;">Name</th>
              <th style="text-align:left;padding:6px 8px;font-size:11px;color:rgba(13,59,110,0.45);text-transform:uppercase;">Type</th>
              <th style="text-align:left;padding:6px 8px;font-size:11px;color:rgba(13,59,110,0.45);text-transform:uppercase;">Dates</th>
            </tr></thead>
            <tbody>${pendingRows}</tbody>
          </table>

          <!-- Hours table -->
          <h2 style="color:#0D3B6E;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 10px;">Team Hours — ${monthLabel}</h2>
          <p style="font-size:12px;color:rgba(43,48,58,0.45);margin:0 0 12px;">Expected hours reflect actual Mon–Fri working days in the month at 7.5h/day.</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
            <thead><tr style="border-bottom:1px solid #e5e7eb;">
              <th style="text-align:left;padding:6px 8px;font-size:11px;color:rgba(13,59,110,0.45);text-transform:uppercase;">Name</th>
              <th style="text-align:right;padding:6px 8px;font-size:11px;color:rgba(13,59,110,0.45);text-transform:uppercase;">Hours</th>
              <th style="text-align:right;padding:6px 8px;font-size:11px;color:rgba(13,59,110,0.45);text-transform:uppercase;">Expected</th>
              <th style="text-align:left;padding:6px 8px;font-size:11px;color:rgba(13,59,110,0.45);text-transform:uppercase;">Status</th>
            </tr></thead>
            <tbody>${hoursRows}</tbody>
          </table>

          ${notesSection}

          <div style="text-align:center;margin-top:28px;">
            <a href="https://westerndentalacademy.com/staff/owner"
               style="background-color:#0D3B6E;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;display:inline-block;">
              View Full Dashboard →
            </a>
          </div>
        </div>

        <div style="padding:16px 32px;background-color:#F4F7F9;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">
            Western Dental Academy — westerndentalacademy.com<br>
            This summary is sent automatically on the 1st of each month.
          </p>
        </div>
      </div>`

    // ── Send to each owner ────────────────────────────────────────────────────
    const results = await Promise.allSettled(
      owners.map((owner: any) =>
        resend.emails.send({
          from: 'Western Dental Academy <info@westerndentalacademy.com>',
          to: owner.email,
          subject: `WDA Staff Hours — ${monthLabel}`,
          html,
        })
      )
    )

    const sent   = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return Response.json({
      success: true,
      message: `Sent monthly staff summary to ${sent} owner(s), ${failed} failed`,
      range: { start: startIso, end: endIso },
    })
  } catch (error) {
    console.error('Staff monthly summary cron error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
