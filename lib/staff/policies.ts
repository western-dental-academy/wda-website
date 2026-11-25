import { createClient } from '@sanity/client'
import { Resend } from 'resend'

// Staff policy acknowledgements: shared queries, status logic and emails.
// Pages: /staff/policies (staff), /staff/owner/policies (owners). Cron: /api/cron/policy-reminders.

export const policyClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export const SITE_URL = 'https://westerndentalacademy.com'
export const DEFAULT_ATTESTATION = 'I confirm that I have read, understood, and agree to comply with this policy.'

export interface PolicyQuestion {
  _key: string
  question: string
  kind?: 'choice' | 'text'
  options?: string[]
  required?: boolean
}

export interface PolicySummary {
  _id: string
  _rev: string
  title: string
  slug: string
  version: string
  effectiveDate?: string
  summary?: string
  category?: string
  requiresCountersign?: boolean
  notifiedVersion?: string
  assignedIds: string[] | null
}

export interface StaffLite {
  _id: string
  fullName: string
  email: string
  jobTitle?: string
  role?: string
}

export interface AckLite {
  _id: string
  policyId: string
  staffId: string
  policyVersion: string
  acknowledgedAt: string
  signedName?: string
  countersignedBy?: string
  countersignedAt?: string
  responses?: Array<{ question: string; answer: string }>
}

export type PolicyStatus = 'signed' | 'outdated' | 'outstanding'

export const ACTIVE_POLICIES_QUERY = `*[_type == "policy" && !(_id in path("drafts.**")) && active == true] | order(title asc){
  _id, _rev, title, "slug": slug.current, version, effectiveDate, summary, category, requiresCountersign, notifiedVersion,
  "assignedIds": assignedTo[]._ref
}`

export const ACTIVE_STAFF_QUERY = `*[_type == "staffMember" && !(_id in path("drafts.**")) && active == true] | order(fullName asc){
  _id, fullName, email, jobTitle, role
}`

export const ACKS_QUERY = `*[_type == "policyAcknowledgement" && !(_id in path("drafts.**"))] | order(acknowledgedAt desc){
  _id, "policyId": policy._ref, "staffId": staffMember._ref, policyVersion, acknowledgedAt, signedName,
  countersignedBy, countersignedAt, responses
}`

export function appliesTo(policy: Pick<PolicySummary, 'assignedIds'>, staffId: string): boolean {
  return !policy.assignedIds?.length || policy.assignedIds.includes(staffId)
}

// Latest acknowledgement this staff member made for this policy (any version)
export function latestAck(acks: AckLite[], policyId: string, staffId: string): AckLite | undefined {
  return acks
    .filter(a => a.policyId === policyId && a.staffId === staffId)
    .sort((a, b) => b.acknowledgedAt.localeCompare(a.acknowledgedAt))[0]
}

export function statusFor(policy: PolicySummary, ack: AckLite | undefined): PolicyStatus {
  if (!ack) return 'outstanding'
  return ack.policyVersion === policy.version ? 'signed' : 'outdated'
}

export function ackDocId(policyId: string, staffId: string, version: string): string {
  return `policyAck-${policyId}-${staffId}-v${version}`.replace(/[^a-zA-Z0-9_-]/g, '-')
}

export function normaliseName(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z]/g, '')
}

export function fmtDate(iso: string, withTime = false): string {
  return new Date(iso).toLocaleString('en-CA', {
    timeZone: 'America/Regina',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })
}

// Portable Text → plain text (kept with each signature as the record of what was signed)
type TextBlock = { _type?: string; listItem?: string; children?: Array<{ text?: string }> }
export function blocksToText(blocks: TextBlock[] | undefined): string {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .filter(b => b?._type === 'block')
    .map(b => {
      const text = (b.children ?? []).map(c => c.text ?? '').join('')
      return b.listItem ? `• ${text}` : text
    })
    .join('\n')
}

export async function getStaffByClerkId(clerkUserId: string): Promise<StaffLite | null> {
  return policyClient.fetch(
    `*[_type == "staffMember" && !(_id in path("drafts.**")) && clerkUserId == $uid && active == true][0]{ _id, fullName, email, jobTitle, role }`,
    { uid: clerkUserId },
  )
}

// Policies assigned to one staff member, each with that person's status
export async function getPoliciesForStaff(staffId: string) {
  const [policies, acks] = await Promise.all([
    policyClient.fetch<PolicySummary[]>(ACTIVE_POLICIES_QUERY),
    policyClient.fetch<AckLite[]>(
      `*[_type == "policyAcknowledgement" && !(_id in path("drafts.**")) && staffMember._ref == $id]{
        _id, "policyId": policy._ref, "staffId": staffMember._ref, policyVersion, acknowledgedAt, signedName, countersignedBy, countersignedAt
      }`,
      { id: staffId },
    ),
  ])
  return policies
    .filter(p => appliesTo(p, staffId))
    .map(p => {
      const ack = latestAck(acks, p._id, staffId)
      return { policy: p, ack, status: statusFor(p, ack) }
    })
}

// ── Emails ────────────────────────────────────────────────────────────────

const FROM = 'Western Dental Academy <info@westerndentalacademy.com>'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function emailShell(heading: string, intro: string, items: Array<{ title: string; note: string; url: string }>): string {
  const rows = items
    .map(
      i => `
      <tr><td style="padding:14px 16px;background:#F4F7F9;border-radius:10px;">
        <p style="margin:0 0 4px;font:600 15px Montserrat,Arial,sans-serif;color:#0D3B6E;">${esc(i.title)}</p>
        <p style="margin:0 0 10px;font:13px 'Open Sans',Arial,sans-serif;color:#5b6270;">${esc(i.note)}</p>
        <a href="${i.url}" style="display:inline-block;background:#378ADD;color:#fff;text-decoration:none;font:600 13px Montserrat,Arial,sans-serif;padding:8px 14px;border-radius:8px;">Read and sign</a>
      </td></tr><tr><td style="height:10px"></td></tr>`,
    )
    .join('')
  return `<!doctype html><html><body style="margin:0;background:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <tr><td style="background:#0D3B6E;border-radius:12px;padding:20px 22px;">
      <p style="margin:0;font:700 11px Montserrat,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.5);">Western Dental Academy · Staff</p>
      <p style="margin:6px 0 0;font:700 20px Montserrat,Arial,sans-serif;color:#fff;">${esc(heading)}</p>
    </td></tr>
    <tr><td style="padding:18px 2px 14px;font:14px/1.6 'Open Sans',Arial,sans-serif;color:#2B303A;">${intro}</td></tr>
    ${rows}
    <tr><td style="padding:8px 2px;font:12px/1.6 'Open Sans',Arial,sans-serif;color:#8a909b;">
      You can see all your policies any time at <a href="${SITE_URL}/staff/policies" style="color:#378ADD;">westerndentalacademy.com/staff/policies</a>.
      This is an internal staff email.
    </td></tr>
  </table></body></html>`
}

export interface PolicyEmailResult {
  newPolicyEmails: Array<{ to: string; policies: string[] }>
  reminderEmails: Array<{ to: string; policies: string[] }>
  markedNotified: string[]
  errors: string[]
}

/**
 * newPolicies: email staff about any active policy whose current version hasn't been announced yet,
 *              then mark it announced (notifiedVersion = version).
 * reminders:   email every staff member who still has anything outstanding (skipping anyone who
 *              just got a new-policy email in this run).
 * dryRun:      work out who would be emailed without sending or saving anything.
 */
export async function sendPolicyEmails(opts: { newPolicies: boolean; reminders: boolean; dryRun?: boolean }): Promise<PolicyEmailResult> {
  const [policies, staff, acks] = await Promise.all([
    policyClient.fetch<PolicySummary[]>(ACTIVE_POLICIES_QUERY),
    policyClient.fetch<StaffLite[]>(ACTIVE_STAFF_QUERY),
    policyClient.fetch<AckLite[]>(ACKS_QUERY),
  ])
  const resend = new Resend(process.env.RESEND_API_KEY)
  const result: PolicyEmailResult = { newPolicyEmails: [], reminderEmails: [], markedNotified: [], errors: [] }
  const emailedNow = new Set<string>()

  // Resend allows ~2 requests a second, and reports failures in the result rather than throwing
  const send = async (to: string, subject: string, html: string) => {
    if (opts.dryRun) return
    await new Promise(r => setTimeout(r, 600))
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) throw new Error(error.message)
  }

  const outstandingFor = (s: StaffLite, list: PolicySummary[]) =>
    list.filter(p => appliesTo(p, s._id) && statusFor(p, latestAck(acks, p._id, s._id)) !== 'signed')

  if (opts.newPolicies) {
    const fresh = policies.filter(p => p.notifiedVersion !== p.version)
    for (const s of staff) {
      if (!s.email) continue
      const mine = outstandingFor(s, fresh)
      if (!mine.length) continue
      const items = mine.map(p => ({
        title: `${p.title} (version ${p.version})`,
        note: p.notifiedVersion ? 'This policy has been updated. Please review and sign the new version.' : (p.summary ?? 'New policy for all staff.'),
        url: `${SITE_URL}/staff/policies/${p.slug}`,
      }))
      const subject = mine.length === 1 ? `Please read and sign: ${mine[0].title}` : `${mine.length} policies to read and sign`
      const html = emailShell(
        mine.length === 1 ? 'A policy needs your signature' : 'Policies need your signature',
        `Hi ${esc(s.fullName.split(' ')[0])},<br/>Please read the following and confirm you have read and understood it. It only takes a few minutes, and you'll be asked to sign with your name at the end.`,
        items,
      )
      try {
        await send(s.email, subject, html)
        result.newPolicyEmails.push({ to: s.email, policies: mine.map(p => p.title) })
        emailedNow.add(s._id)
      } catch (err) {
        result.errors.push(`${s.email}: ${String(err)}`)
      }
    }
    for (const p of fresh) {
      if (!opts.dryRun) await policyClient.patch(p._id).set({ notifiedVersion: p.version }).commit()
      result.markedNotified.push(p.title)
    }
  }

  if (opts.reminders) {
    for (const s of staff) {
      if (!s.email || emailedNow.has(s._id)) continue
      const mine = outstandingFor(s, policies)
      if (!mine.length) continue
      const items = mine.map(p => {
        const ack = latestAck(acks, p._id, s._id)
        return {
          title: p.title,
          note: ack ? `Updated to version ${p.version}. You signed version ${ack.policyVersion}.` : `Version ${p.version}, not yet signed.`,
          url: `${SITE_URL}/staff/policies/${p.slug}`,
        }
      })
      const subject = mine.length === 1 ? `Reminder: please sign ${mine[0].title}` : `Reminder: ${mine.length} policies still need your signature`
      const html = emailShell(
        'Outstanding policies',
        `Hi ${esc(s.fullName.split(' ')[0])},<br/>Just a reminder that ${mine.length === 1 ? 'this policy is' : 'these policies are'} still waiting for your signature.`,
        items,
      )
      try {
        await send(s.email, subject, html)
        result.reminderEmails.push({ to: s.email, policies: mine.map(p => p.title) })
      } catch (err) {
        result.errors.push(`${s.email}: ${String(err)}`)
      }
    }
  }

  return result
}
