import { Resend } from 'resend'
import { buildContent, loadIssue, sanity, ISSUE_PROJECTION, type NewsletterCourse, type NewsletterIssue } from './content'
import { NEWSLETTER_FROM, renderNewsletter, renderWelcome, SITE_URL } from './render'
import { albertaSendTime, albertaToday, formatAlberta, nextFirstTuesday } from './schedule'

// Sending the monthly newsletter.
//
// Vercel's Hobby plan runs crons once a day, so the daily job (9 AM Alberta)
// picks up any issue that is ready and due within the next 24 hours and hands
// each email to Resend with scheduledAt, so it arrives at the exact minute.
// Every address handed over is recorded on the issue (sentTo) and each email
// carries an idempotency key, so a rerun never sends anyone a second copy.

const resend = new Resend(process.env.RESEND_API_KEY)

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const HORIZON = DAY            // queue an issue at most this far ahead of its send time
const MAX_LATE = 3 * DAY       // a missed issue still goes out if no more than this late
const TIME_BUDGET_MS = 240_000 // stop early and finish next run rather than time out
const SEND_GAP_MS = 550        // stay under Resend's default 2 requests/second

export const NEWSLETTER_OWNER = 'aiden@westerndentalacademy.com'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export interface Recipient { _id: string; email: string; firstName?: string; unsubscribeToken: string }

/**
 * Everyone who has given consent: people who signed up on the website or
 * ticked the box when registering, plus workshop invitees who clicked the
 * confirm link. Unconfirmed invitees and unsubscribed people are left out.
 */
export async function getRecipients(): Promise<Recipient[]> {
  const rows = await sanity.fetch<{ _id: string; email: string; firstName?: string; unsubscribeToken?: string }[]>(
    `*[_type == "subscriber" && !(_id in path("drafts.**")) && active != false && defined(email)
        && (confirmed == true || source != "invite")] | order(subscribedAt asc){ _id, email, firstName, unsubscribeToken }`,
  )
  const seen = new Set<string>()
  const out: Recipient[] = []
  const missingTokens: { id: string; token: string }[] = []
  for (const r of rows) {
    const email = r.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || seen.has(email)) continue
    seen.add(email)
    let token = r.unsubscribeToken
    if (!token) { token = crypto.randomUUID(); missingTokens.push({ id: r._id, token }) }
    out.push({ _id: r._id, email, firstName: r.firstName?.trim() || undefined, unsubscribeToken: token })
  }
  if (missingTokens.length) {
    const tx = sanity.transaction()
    for (const m of missingTokens) tx.patch(m.id, p => p.setIfMissing({ unsubscribeToken: m.token }))
    await tx.commit()
  }
  return out
}

function listUnsubscribeHeaders(token: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${SITE_URL}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}>, <mailto:info@westerndentalacademy.com?subject=Unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

export interface IssueResult {
  id: string
  subject: string
  sendAt: string
  action: 'not-due' | 'too-late' | 'queued' | 'marked-sent' | 'nothing-to-do'
  recipients?: number
  sent?: number
  failed?: number
  remaining?: number
  errors?: string[]
}

async function processIssue(issue: NewsletterIssue, opts: { dryRun: boolean; startedAt: number }): Promise<IssueResult> {
  const sendAt = albertaSendTime(issue.sendDate, issue.sendTime)
  const now = Date.now()
  const base = { id: issue._id, subject: issue.subject, sendAt: sendAt.toISOString() }

  if (sendAt.getTime() - now > HORIZON) return { ...base, action: 'not-due' }

  // Already queued in full on an earlier run: once the send time passes, call it sent.
  if (issue.deliveryStatus === 'scheduled') {
    if (now >= sendAt.getTime() && !opts.dryRun) {
      await sanity.patch(issue._id).set({ deliveryStatus: 'sent' }).commit()
      return { ...base, action: 'marked-sent' }
    }
    return { ...base, action: 'nothing-to-do' }
  }

  if (now - sendAt.getTime() > MAX_LATE) return { ...base, action: 'too-late' }

  const content = await buildContent(issue, sendAt)
  const already = new Set((issue.sentTo ?? []).map(e => e.toLowerCase()))
  const recipients = (await getRecipients()).filter(r => !already.has(r.email))
  const sendLater = sendAt.getTime() > now + 60_000

  if (opts.dryRun) {
    return { ...base, action: 'queued', recipients: recipients.length, sent: 0, failed: 0, remaining: recipients.length }
  }

  const sentNow: string[] = []
  const errors: string[] = []
  let processed = 0
  const flush = async () => {
    if (!sentNow.length) return
    const batch = sentNow.splice(0)
    await sanity.patch(issue._id).setIfMissing({ sentTo: [] }).append('sentTo', batch).commit()
  }

  for (const r of recipients) {
    if (Date.now() - opts.startedAt > TIME_BUDGET_MS) break
    processed++
    const { html, text } = renderNewsletter(content, { unsubscribeToken: r.unsubscribeToken, firstName: r.firstName })
    try {
      const { error } = await resend.emails.send(
        {
          from: NEWSLETTER_FROM,
          to: r.email,
          subject: issue.subject,
          html,
          text,
          headers: listUnsubscribeHeaders(r.unsubscribeToken),
          tags: [{ name: 'category', value: 'newsletter' }],
          ...(sendLater ? { scheduledAt: sendAt.toISOString() } : {}),
        },
        { idempotencyKey: `newsletter-${issue._id}-${r._id}` },
      )
      if (error) errors.push(`${r.email}: ${error.message}`)
      else sentNow.push(r.email)
    } catch (err) {
      errors.push(`${r.email}: ${String(err)}`)
    }
    if (sentNow.length >= 20) await flush()
    await sleep(SEND_GAP_MS)
  }
  await flush()

  const remaining = recipients.length - processed + errors.length
  const done = remaining === 0
  const lastError = errors.length ? errors.slice(0, 10).join('\n') : (done ? undefined : 'Ran out of time; the rest go out on the next daily run.')
  const status = sanity.patch(issue._id).set({
    deliveryStatus: done ? (sendLater ? 'scheduled' : 'sent') : 'partial',
    scheduledFor: sendAt.toISOString(),
    recipientCount: (issue.sentTo?.length ?? 0) + processed - errors.length,
    queuedAt: new Date().toISOString(),
  })
  await (lastError ? status.set({ lastError }) : status.unset(['lastError'])).commit()

  return { ...base, action: 'queued', recipients: recipients.length, sent: processed - errors.length, failed: errors.length, remaining, errors: errors.slice(0, 10) }
}

/** The daily job: queue or send every issue that is due. */
export async function runNewsletters(opts: { dryRun?: boolean } = {}): Promise<{ issues: IssueResult[]; reminder?: string }> {
  const dryRun = opts.dryRun === true
  const startedAt = Date.now()
  const today = albertaToday()
  const windowStart = albertaToday(new Date(Date.now() - MAX_LATE - DAY))
  const windowEnd = albertaToday(new Date(Date.now() + 2 * DAY))

  const issues = await sanity.fetch<NewsletterIssue[]>(
    `*[_type == "newsletter" && !(_id in path("drafts.**")) && readyToSend == true
        && deliveryStatus != "sent" && sendDate >= $windowStart && sendDate <= $windowEnd]
      | order(sendDate asc)${ISSUE_PROJECTION}`,
    { windowStart, windowEnd },
  )

  const results: IssueResult[] = []
  for (const issue of issues) {
    try {
      results.push(await processIssue(issue, { dryRun, startedAt }))
    } catch (err) {
      console.error('Newsletter send error', issue._id, err)
      results.push({ id: issue._id, subject: issue.subject, sendAt: '', action: 'nothing-to-do', errors: [String(err)] })
      if (!dryRun) await sanity.patch(issue._id).set({ deliveryStatus: 'partial', lastError: String(err) }).commit().catch(() => {})
    }
  }

  const reminder = await maybeRemindOwner(today, dryRun)
  return { issues: results, reminder }
}

/**
 * A heads-up to Aiden 7 days and 2 days before the next first Tuesday when no
 * issue for that day is published and ticked "Ready to send".
 */
async function maybeRemindOwner(today: string, dryRun: boolean): Promise<string | undefined> {
  const target = nextFirstTuesday()
  const daysLeft = Math.round((Date.parse(target) - Date.parse(today)) / DAY)
  if (daysLeft !== 7 && daysLeft !== 2) return undefined

  // Drafts are included on purpose here, to tell an unpublished draft from no issue at all.
  const issue = await sanity.fetch<{ _id: string; readyToSend?: boolean; subject?: string } | null>(
    `*[_type == "newsletter" && sendDate >= $today && sendDate <= $target] | order(_updatedAt desc)[0]{ _id, readyToSend, subject }`,
    { today, target },
  )
  const published = issue && !issue._id.startsWith('drafts.')
  if (published && issue.readyToSend) return undefined

  const when = formatAlberta(albertaSendTime(target, '10:00'), { withTime: false })
  const problem = !issue
    ? `There's no newsletter for ${when} yet.`
    : !published
      ? `The newsletter "${issue.subject ?? 'Untitled'}" for ${when} is still an unpublished draft.`
      : `The newsletter "${issue.subject ?? 'Untitled'}" for ${when} isn't ticked "Ready to send" yet.`
  const message = `${problem} It needs to be published with "Ready to send" ticked by 9 AM the day before (${daysLeft} days left).`

  if (!dryRun) {
    await resend.emails.send({
      from: NEWSLETTER_FROM,
      to: NEWSLETTER_OWNER,
      subject: `Newsletter reminder: ${daysLeft} days until ${when}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#374151;max-width:560px;">
        <p>${message}</p>
        <p>Open <a href="${SITE_URL}/studio/structure/newsletter">Newsletters in the Studio</a>, write the intro, tick "Ready to send" and publish. Upcoming workshops and online courses fill themselves in.</p>
        <p style="color:#9ca3af;font-size:12px;">Automatic reminder from the website's newsletter job.</p></div>`,
    }, { idempotencyKey: `newsletter-reminder-${target}-${daysLeft}` })
  }
  return message
}

// ── Tests and previews ───────────────────────────────────────────────────────

/** Renders an issue (draft included) exactly as a subscriber would get it. */
export async function renderIssuePreview(id: string, firstName?: string) {
  const issue = await loadIssue(id, { draft: true })
  if (!issue) return null
  const sendAt = issue.sendDate ? albertaSendTime(issue.sendDate, issue.sendTime) : new Date()
  const content = await buildContent({ ...issue, headline: issue.headline || 'Untitled', subject: issue.subject || 'Untitled' }, sendAt)
  return { issue, ...renderNewsletter(content, { unsubscribeToken: 'preview', firstName }) }
}

/** Sends one copy of an issue (draft included) to a staff address, marked as a test. */
export async function sendTestIssue(id: string, to: string, firstName?: string) {
  const preview = await renderIssuePreview(id, firstName)
  if (!preview) throw new Error('Newsletter not found')
  const { error } = await resend.emails.send({
    from: NEWSLETTER_FROM,
    to,
    subject: `[TEST] ${preview.issue.subject || 'Untitled newsletter'}`,
    html: preview.html,
    text: preview.text,
  })
  if (error) throw new Error(error.message)
  const baseId = id.replace(/^drafts\./, '')
  await sanity.patch(baseId).set({ testSentAt: new Date().toISOString() }).commit().catch(() => {})
  return { to }
}

// ── Welcome email ────────────────────────────────────────────────────────────

/**
 * Sends the welcome email to a subscriber once. Safe to call from any signup
 * path: it does nothing if the welcome already went out, if they unsubscribed,
 * or if they're an invitee who hasn't confirmed yet.
 */
export async function sendWelcomeEmail(email: string): Promise<boolean> {
  try {
    const normal = email.trim().toLowerCase()
    const sub = await sanity.fetch<{ _id: string; email: string; firstName?: string; unsubscribeToken?: string; welcomeSentAt?: string; active?: boolean; confirmed?: boolean; source?: string } | null>(
      `*[_type == "subscriber" && !(_id in path("drafts.**")) && lower(email) == $email][0]{ _id, email, firstName, unsubscribeToken, welcomeSentAt, active, confirmed, source }`,
      { email: normal },
    )
    if (!sub || sub.welcomeSentAt || sub.active === false) return false
    if (sub.source === 'invite' && sub.confirmed !== true) return false

    const token = sub.unsubscribeToken ?? crypto.randomUUID()
    const courses = await sanity.fetch<NewsletterCourse[]>(
      `*[_type == "onlineCourse" && !(_id in path("drafts.**")) && active == true] | order(_createdAt desc){ _id, title, price, hours, "createdAt": _createdAt }`,
    )
    const { subject, html, text } = renderWelcome({ unsubscribeToken: token, firstName: sub.firstName?.trim() || undefined, courses })
    const { error } = await resend.emails.send(
      { from: NEWSLETTER_FROM, to: normal, subject, html, text, headers: listUnsubscribeHeaders(token), tags: [{ name: 'category', value: 'newsletter-welcome' }] },
      { idempotencyKey: `newsletter-welcome-${sub._id}` },
    )
    if (error) { console.error('Welcome email error:', error); return false }
    await sanity.patch(sub._id).set({ welcomeSentAt: new Date().toISOString() }).setIfMissing({ unsubscribeToken: token }).commit()
    return true
  } catch (err) {
    console.error('Welcome email error:', err)
    return false
  }
}

// ── Unsubscribe ──────────────────────────────────────────────────────────────

export async function findByToken(token: string) {
  if (!token || token === 'preview') return null
  return sanity.fetch<{ _id: string; email: string; active?: boolean } | null>(
    `*[_type == "subscriber" && !(_id in path("drafts.**")) && unsubscribeToken == $unsub][0]{ _id, email, active }`,
    { unsub: token },
  )
}

export async function setSubscribed(token: string, subscribed: boolean): Promise<{ email: string } | null> {
  const sub = await findByToken(token)
  if (!sub) return null
  const patch = sanity.patch(sub._id)
  if (subscribed) await patch.set({ active: true }).unset(['unsubscribedAt']).commit()
  else await patch.set({ active: false, unsubscribedAt: new Date().toISOString() }).commit()
  return { email: sub.email }
}
