import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { workshopInstructions } from '@/lib/workshops/emails'

// Workshop reminder emails.
//
// Which reminders a registrant gets:
//   in-person: 1 week before + 24 hours before
//   virtual:   24 hours before + 1 hour before (with how to find their Teams link)
//
// Vercel's Hobby plan only allows a once-a-day cron, so the daily run (and the
// registration success page, for late sign-ups) hands Resend every reminder
// that falls due in the next ~26 hours with a scheduled send time. Resend then
// delivers each one at the exact minute. A field on the registration records
// when each reminder was scheduled, so nothing is sent twice.

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const FROM = 'Western Dental Academy <info@westerndentalacademy.com>'
const STAFF_INBOX = 'info@westerndentalacademy.com'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

// How far ahead one run schedules. Longer than a day so a cron run that starts
// late in its hour still overlaps the next one; the sent fields stop doubles.
const HORIZON = 26 * HOUR

export type ReminderKind = 'week' | 'day' | 'hour'

const REMINDERS: Record<ReminderKind, {
  offset: number
  field: string
  // A missed reminder is still sent late if at least this much time is left
  minLeadForCatchUp: number
}> = {
  week: { offset: 7 * DAY, field: 'reminderWeekScheduledFor', minLeadForCatchUp: 4 * DAY },
  day: { offset: DAY, field: 'reminderDayScheduledFor', minLeadForCatchUp: 3 * HOUR },
  hour: { offset: HOUR, field: 'reminderHourScheduledFor', minLeadForCatchUp: 40 * 60 * 1000 },
}

interface ReminderRegistration {
  _id: string
  firstName: string
  lastName: string
  email: string
  workshop: string
  deliveryMethod?: string
  registeredAt: string
  teamsRegistrationId?: string
  teamsRegistrationError?: string
  reminderWeekScheduledFor?: string
  reminderDayScheduledFor?: string
  reminderHourScheduledFor?: string
  date: {
    _id: string
    date: string
    active?: boolean
    teamsWebinarId?: string
    title?: string
    includesFood?: boolean
  }
}

export interface PlannedReminder {
  registrationId: string
  name: string
  email: string
  workshop: string
  delivery: 'in-person' | 'virtual'
  kind: ReminderKind
  eventStart: string
  sendAt: string
  sendNow: boolean
}

export interface ReminderRunResult {
  planned: PlannedReminder[]
  sent: number
  failed: { registrationId: string; kind: ReminderKind; error: string }[]
  teamsIssues: { name: string; email: string; workshop: string; problem: string }[]
  dryRun: boolean
}

function kindsFor(delivery: 'in-person' | 'virtual'): ReminderKind[] {
  return delivery === 'virtual' ? ['day', 'hour'] : ['week', 'day']
}

// Decide which reminders are due for one registration. Exported for tests.
export function planReminders(reg: ReminderRegistration, now: Date): PlannedReminder[] {
  const start = new Date(reg.date.date).getTime()
  const nowMs = now.getTime()
  if (!Number.isFinite(start) || start <= nowMs) return []

  const delivery = reg.deliveryMethod === 'virtual' ? 'virtual' : 'in-person'
  const registeredAt = new Date(reg.registeredAt).getTime()
  const out: PlannedReminder[] = []

  for (const kind of kindsFor(delivery)) {
    const cfg = REMINDERS[kind]
    if ((reg as unknown as Record<string, unknown>)[cfg.field]) continue

    const target = start - cfg.offset
    if (target > nowMs + HORIZON) continue // a later run will pick it up

    let sendAt = target
    let sendNow = false
    if (target <= nowMs + 60 * 1000) {
      // The ideal time has passed (or is under a minute away). Someone who
      // signed up after it already has a fresh confirmation email, so only
      // catch up for earlier registrants, and only with real lead time left.
      if (registeredAt >= target) continue
      if (start - nowMs < cfg.minLeadForCatchUp) continue
      sendAt = nowMs
      sendNow = true
    }

    out.push({
      registrationId: reg._id,
      name: `${reg.firstName} ${reg.lastName}`.trim(),
      email: reg.email,
      workshop: reg.workshop,
      delivery,
      kind,
      eventStart: reg.date.date,
      sendAt: new Date(sendAt).toISOString(),
      sendNow,
    })
  }
  return out
}

// ── Formatting ──────────────────────────────────────────────────────────────

// America/Regina is fixed UTC-6, which is what Alberta now uses year-round.
export function formatEventDate(iso: string): string {
  const d = new Date(iso)
  const day = d.toLocaleDateString('en-CA', {
    timeZone: 'America/Regina', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const time = d.toLocaleTimeString('en-CA', {
    timeZone: 'America/Regina', hour: 'numeric', minute: '2-digit',
  })
  return `${day} at ${time} Alberta time (UTC-6)`
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Western+Dental+Academy+150+Chippewa+Road+Suite+258'

export function reminderSubject(kind: ReminderKind, workshop: string, delivery: 'in-person' | 'virtual'): string {
  if (kind === 'week') return `One week to go: ${workshop}`
  if (kind === 'day') return delivery === 'virtual'
    ? `Tomorrow: ${workshop} (virtual) — have your Teams link ready`
    : `See you tomorrow: ${workshop}`
  return `Starting in 1 hour: ${workshop}`
}

export function reminderHtml(opts: {
  kind: ReminderKind
  firstName: string
  workshop: string
  delivery: 'in-person' | 'virtual'
  eventStart: string
  includesFood?: boolean
}): string {
  const { kind, firstName, workshop, delivery, eventStart, includesFood } = opts
  const when = formatEventDate(eventStart)
  const isVirtual = delivery === 'virtual'

  const headline =
    kind === 'week' ? 'Your workshop is one week away'
    : kind === 'day' ? 'Your workshop is tomorrow'
    : 'Your workshop starts in 1 hour'

  const intro =
    kind === 'week'
      ? "Just a friendly reminder that you're registered for an upcoming workshop at Western Dental Academy. Here are the details so you can plan your week."
    : kind === 'day'
      ? isVirtual
        ? "We're looking forward to having you join us online tomorrow. Here's everything you need."
        : "We're looking forward to seeing you tomorrow. Here's everything you need."
    : "We're getting ready to start. Here's how to join."

  const whereBlock = isVirtual
    ? `<div style="background-color:#EFF6FF;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #378ADD;">
        <p style="color:#1E3560;font-size:14px;font-weight:700;margin:0 0 10px;">How to Join on Microsoft Teams</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 10px;">Your personal join link was emailed to you by <strong>Microsoft Teams</strong> when you registered. Search your inbox (and junk or spam folder) for <strong>${esc(workshop)}</strong> to find it, then use the <strong>Join</strong> button in that email.</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 10px;">The link is unique to you, so please don't share it. You can join from the Teams app or your web browser; we suggest joining a few minutes early to test your audio and camera.</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0;">${kind === 'hour'
          ? `Can't find your link? Reply to this email or write to <a href="mailto:info@westerndentalacademy.com" style="color:#378ADD;">info@westerndentalacademy.com</a> right away and we'll help you get in.`
          : `Can't find your link? Reply to this email or write to <a href="mailto:info@westerndentalacademy.com" style="color:#378ADD;">info@westerndentalacademy.com</a> before the workshop and we'll make sure you have it.`}</p>
      </div>`
    : `<div style="background-color:#F4F7F9;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:#1E3560;font-size:14px;font-weight:700;margin:0 0 8px;">Where</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 6px;">Western Dental Academy<br/>150 Chippewa Road, Suite 258 (second floor)</p>
        <p style="font-size:14px;margin:0 0 10px;"><a href="${MAP_URL}" style="color:#378ADD;">Open in Google Maps</a></p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0;">Please arrive 10 to 15 minutes early so we can check you in and start on time.${includesFood ? ' Refreshments are provided.' : ''}</p>
      </div>`

  const bring = !isVirtual ? workshopInstructions(workshop) : ''

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background-color:#1E3560;padding:28px 32px;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">${headline}</h1>
        <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
        <p style="color:#1E3560;font-size:15px;margin:0 0 16px;">Hi ${esc(firstName)},</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px;">${intro}</p>
        <p style="color:#1E3560;font-size:16px;font-weight:700;margin:0 0 8px;">${esc(workshop)}</p>
        <p style="color:#374151;font-size:14px;margin:0 0 4px;">${when}</p>
        <p style="font-size:13px;font-weight:600;margin:0 0 16px;"><span style="background-color:${isVirtual ? '#EFF6FF' : '#EEF2FF'};color:${isVirtual ? '#378ADD' : '#1E3560'};padding:2px 8px;border-radius:4px;">${isVirtual ? 'Virtual' : 'In-Person'}</span></p>
        ${whereBlock}
        ${bring}
        <p style="color:#374151;font-size:14px;line-height:1.6;margin-top:16px;">
          ${kind === 'hour'
            ? 'See you soon!'
            : `Can't make it anymore? Please let us know at <a href="mailto:info@westerndentalacademy.com" style="color:#378ADD;">info@westerndentalacademy.com</a>${isVirtual ? '.' : ' so we can offer your spot to someone on the waitlist.'}`}
        </p>
      </div>
      <div style="padding:16px 32px;background-color:#F4F7F9;text-align:center;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">You're receiving this because you registered for this workshop. Western Dental Academy — westerndentalacademy.com</p>
      </div>
    </div>`
}

// ── Run ─────────────────────────────────────────────────────────────────────

const REG_PROJECTION = `{
  _id, firstName, lastName, email, workshop, deliveryMethod,
  "registeredAt": coalesce(registeredAt, _createdAt),
  teamsRegistrationId, teamsRegistrationError,
  reminderWeekScheduledFor, reminderDayScheduledFor, reminderHourScheduledFor,
  "date": *[_type == "workshopDate" && _id == ^.workshopDateId][0]{
    _id, date, active,
    "teamsWebinarId": coalesce(teamsWebinarId, offering->teamsWebinarId),
    "title": offering->title,
    "includesFood": offering->includesFood
  }
}`

async function fetchCandidates(now: Date, registrationIds?: string[]): Promise<ReminderRegistration[]> {
  const until = new Date(now.getTime() + 7 * DAY + HORIZON).toISOString()
  const idFilter = registrationIds?.length ? '&& _id in $ids' : ''
  const regs = await sanity.fetch<ReminderRegistration[]>(
    `*[_type == "workshopRegistration" && !(_id in path("drafts.**"))
       && stripePaymentStatus == "paid" && defined(workshopDateId) && defined(email)
       && workshopDateId in *[_type == "workshopDate" && !(_id in path("drafts.**"))
            && active != false && date > $now && date <= $until]._id
       ${idFilter}
     ]${REG_PROJECTION}`,
    { now: now.toISOString(), until, ids: registrationIds ?? [] },
  )
  return regs.filter(r => r.date?.date)
}

export async function runWorkshopReminders(opts: {
  now?: Date
  dryRun?: boolean
  registrationIds?: string[]
} = {}): Promise<ReminderRunResult> {
  const now = opts.now ?? new Date()
  const dryRun = !!opts.dryRun
  const regs = await fetchCandidates(now, opts.registrationIds)

  const planned: PlannedReminder[] = []
  const byId = new Map(regs.map(r => [r._id, r]))
  for (const r of regs) planned.push(...planReminders(r, now))

  // Virtual registrants whose Teams sign-up didn't work won't have a link from
  // Microsoft. Flag them to staff when their 24-hour reminder goes out.
  const teamsIssues: ReminderRunResult['teamsIssues'] = []
  for (const p of planned) {
    if (p.kind !== 'day' || p.delivery !== 'virtual') continue
    const r = byId.get(p.registrationId)!
    let problem = ''
    if (!r.date.teamsWebinarId) problem = 'No Teams webinar ID is set on this workshop date or offering, so nobody was signed up automatically.'
    else if (r.teamsRegistrationError) problem = `Automatic Teams sign-up failed: ${r.teamsRegistrationError}`
    else if (!r.teamsRegistrationId) problem = 'No record that the automatic Teams sign-up happened.'
    if (problem) teamsIssues.push({ name: p.name, email: p.email, workshop: p.workshop, problem })
  }

  const result: ReminderRunResult = { planned, sent: 0, failed: [], teamsIssues, dryRun }
  if (dryRun || !process.env.RESEND_API_KEY) return result

  const resend = new Resend(process.env.RESEND_API_KEY)

  for (const p of planned) {
    const r = byId.get(p.registrationId)!
    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: p.email,
        replyTo: STAFF_INBOX,
        subject: reminderSubject(p.kind, p.workshop, p.delivery),
        html: reminderHtml({
          kind: p.kind,
          firstName: r.firstName,
          workshop: p.workshop,
          delivery: p.delivery,
          eventStart: p.eventStart,
          includesFood: r.date.includesFood,
        }),
        ...(p.sendNow ? {} : { scheduledAt: p.sendAt }),
      })
      if (error) throw new Error(error.message)
      await sanity.patch(p.registrationId).set({ [REMINDERS[p.kind].field]: p.sendAt }).commit()
      result.sent++
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`Workshop reminder (${p.kind}) failed for ${p.registrationId}:`, message)
      result.failed.push({ registrationId: p.registrationId, kind: p.kind, error: message })
    }
  }

  if (teamsIssues.length > 0 || result.failed.length > 0) {
    try {
      await resend.emails.send({
        from: FROM,
        to: STAFF_INBOX,
        subject: teamsIssues.length > 0
          ? `Action needed: ${teamsIssues.length} virtual registrant${teamsIssues.length > 1 ? 's' : ''} may not have a Teams link`
          : `Workshop reminders: ${result.failed.length} failed to send`,
        html: staffAlertHtml(teamsIssues, result.failed, byId),
      })
    } catch (err) {
      console.error('Workshop reminder staff alert failed:', err)
    }
  }

  return result
}

function staffAlertHtml(
  teamsIssues: ReminderRunResult['teamsIssues'],
  failed: ReminderRunResult['failed'],
  byId: Map<string, ReminderRegistration>,
): string {
  const teams = teamsIssues.map(i =>
    `<li style="margin-bottom:8px;"><strong>${esc(i.name)}</strong> (${esc(i.email)}) — ${esc(i.workshop)}<br/><span style="color:#6b7280;">${esc(i.problem)}</span></li>`,
  ).join('')
  const fails = failed.map(f => {
    const r = byId.get(f.registrationId)
    return `<li style="margin-bottom:8px;"><strong>${esc(r ? `${r.firstName} ${r.lastName}` : f.registrationId)}</strong> — ${f.kind} reminder<br/><span style="color:#6b7280;">${esc(f.error)}</span></li>`
  }).join('')
  return `<div style="font-family:Arial,sans-serif;max-width:640px;">
    ${teams ? `<p>These virtual registrants have a workshop in about 24 hours, but the website could not confirm they were signed up in the Teams webinar, so Microsoft may not have sent them a join link. Please add them to the webinar by hand or send them the registration link today.</p><ul>${teams}</ul>` : ''}
    ${fails ? `<p>These reminder emails could not be sent. The website will try again on its next daily run if there is still time.</p><ul>${fails}</ul>` : ''}
  </div>`
}
