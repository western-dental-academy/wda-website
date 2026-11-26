import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { getCheckoutSession } from '@/lib/payments/checkout'
import { TUTORING_HOURLY_RATE, formatLabel, serviceTitle, type TutoringStatus } from './shared'

export const tutoringClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const resend = new Resend(process.env.RESEND_API_KEY)
export const TUTORING_FROM = 'Western Dental Academy <info@westerndentalacademy.com>'
export const TUTORING_STAFF_INBOX = 'info@westerndentalacademy.com'
const PHONE = '587-269-1644'

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://westerndentalacademy.com'
}

export interface TutoringInquiryRecord {
  _id: string
  _rev?: string
  service: 'tutoring' | 'coaching'
  firstName: string
  lastName: string
  email: string
  phone?: string
  school?: string
  stage?: string
  areas?: string[]
  details?: string
  format?: string
  availability?: string
  submittedAt?: string
  status?: TutoringStatus
  assignedTo?: string
  staffNotes?: string
  hours?: number
  amount?: number
  sessionDetails?: string
  payToken?: string
  paymentRequestedAt?: string
  paymentRequestedBy?: string
  checkoutSessionId?: string
  paymentProvider?: string
  paymentRef?: string
  paidAt?: string
}

export async function getInquiry(id: string): Promise<TutoringInquiryRecord | null> {
  return tutoringClient.fetch<TutoringInquiryRecord | null>(
    `*[_type == "tutoringInquiry" && _id == $id && !(_id in path("drafts.**"))][0]`,
    { id },
  )
}

// ── Email HTML ────────────────────────────────────────────────────────────────

export function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function shell(title: string, body: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background-color:#1E3560;padding:28px 32px;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">${title}</h1>
        <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">${body}</div>
      <div style="padding:16px 32px;background-color:#F4F7F9;text-align:center;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy · ${PHONE} · westerndentalacademy.com</p>
      </div>
    </div>`
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:150px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#1E3560;font-size:13px;font-weight:600;white-space:pre-wrap;">${value}</td>
    </tr>`
}

const p = (t: string) => `<p style="color:#2B303A;font-size:14px;line-height:1.6;margin:0 0 16px;">${t}</p>`

function button(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:#4A9FD4;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;">${label}</a></p>`
}

export function staffInquiryHtml(i: TutoringInquiryRecord): string {
  return shell(`New ${i.service === 'coaching' ? 'Coaching' : 'Tutoring'} Inquiry`, `
    <table style="width:100%;border-collapse:collapse;">
      ${row('Service', esc(serviceTitle(i.service)))}
      ${row('Name', esc(`${i.firstName} ${i.lastName}`))}
      ${row('Email', `<a href="mailto:${esc(i.email)}" style="color:#378ADD;">${esc(i.email)}</a>`)}
      ${i.phone ? row('Phone', esc(i.phone)) : ''}
      ${i.school ? row('School', esc(i.school)) : ''}
      ${i.stage ? row('Stage', esc(i.stage)) : ''}
      ${row('Help with', esc((i.areas ?? []).join(', ') || '—'))}
      ${row('Format', esc(formatLabel(i.format)))}
      ${i.availability ? row('Availability', esc(i.availability)) : ''}
    </table>
    ${i.details ? `<p style="color:#6b7280;font-size:13px;margin:24px 0 8px;">In their words</p>
    <div style="background:#F4F7F9;padding:16px;border-radius:8px;color:#1E3560;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(i.details)}</div>` : ''}
    ${button(`${siteUrl()}/admin?tab=tutoring`, 'Open in WDA Hub')}
    <p style="color:#9ca3af;font-size:12px;margin:0;">Reply to this email to reach ${esc(i.firstName)} directly. Once a tutor and time are agreed, send the payment request from the WDA Hub Tutoring tab.</p>
  `)
}

export function inquiryReceivedHtml(i: TutoringInquiryRecord): string {
  return shell('We received your inquiry', `
    ${p(`Hi ${esc(i.firstName)},`)}
    ${p(`Thank you for your interest in <strong>${esc(serviceTitle(i.service))}</strong> at Western Dental Academy. Our team will review the areas you'd like help with and match you with the right instructor.`)}
    ${p(`We'll be in touch within two business days to set up a time that works for you. Once your session is arranged, we'll email you a secure link to pay ($${TUTORING_HOURLY_RATE} per hour). No payment is needed until then.`)}
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      ${row('Help with', esc((i.areas ?? []).join(', ') || '—'))}
      ${row('Format', esc(formatLabel(i.format)))}
    </table>
    ${p(`Questions in the meantime? Reply to this email or call us at ${PHONE}.`)}
  `)
}

export function paymentRequestHtml(i: TutoringInquiryRecord, payUrl: string): string {
  return shell('Your session is ready to book', `
    ${p(`Hi ${esc(i.firstName)},`)}
    ${p(`Thanks for connecting with us about <strong>${esc(serviceTitle(i.service))}</strong>. Here are the details we arranged:`)}
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      ${i.assignedTo ? row('Instructor', esc(i.assignedTo)) : ''}
      ${i.sessionDetails ? row('Session', esc(i.sessionDetails)) : ''}
      ${row('Hours', esc(i.hours))}
      ${row('Total', `$${esc((i.amount ?? 0).toFixed(2))} CAD`)}
    </table>
    ${button(payUrl, 'Pay securely')}
    ${p(`Your session is confirmed once payment is received. If anything above needs to change, reply to this email or call ${PHONE}.`)}
  `)
}

export function paidStudentHtml(i: TutoringInquiryRecord): string {
  return shell('Payment received', `
    ${p(`Hi ${esc(i.firstName)},`)}
    ${p(`Thank you! Your payment of <strong>$${esc((i.amount ?? 0).toFixed(2))} CAD</strong> for ${esc(serviceTitle(i.service))} has been received.`)}
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      ${i.assignedTo ? row('Instructor', esc(i.assignedTo)) : ''}
      ${i.sessionDetails ? row('Session', esc(i.sessionDetails)) : ''}
      ${row('Hours', esc(i.hours))}
    </table>
    ${p(`We look forward to working with you. Need to reschedule? Reply to this email or call ${PHONE}.`)}
  `)
}

export function paidStaffHtml(i: TutoringInquiryRecord): string {
  return shell('Tutoring / Coaching Paid', `
    <table style="width:100%;border-collapse:collapse;">
      ${row('Name', esc(`${i.firstName} ${i.lastName}`))}
      ${row('Service', esc(serviceTitle(i.service)))}
      ${i.assignedTo ? row('Instructor', esc(i.assignedTo)) : ''}
      ${i.sessionDetails ? row('Session', esc(i.sessionDetails)) : ''}
      ${row('Hours', esc(i.hours))}
      ${row('Paid', `$${esc((i.amount ?? 0).toFixed(2))} CAD`)}
    </table>
  `)
}

export async function sendTutoringEmail(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  return resend.emails.send({ from: TUTORING_FROM, ...opts })
}

// ── Payment confirmation ──────────────────────────────────────────────────────

// Marks an inquiry paid and sends the receipts. Called from the success page,
// the Stripe webhook and the Clover webhook; safe to call more than once.
export async function confirmTutoringPayment(sessionId: string, id: string): Promise<TutoringInquiryRecord | null> {
  const inquiry = await getInquiry(id)
  if (!inquiry || inquiry.checkoutSessionId !== sessionId) return null
  if (inquiry.status === 'paid') return inquiry

  const session = await getCheckoutSession(sessionId)
  if (!session?.paid) return null

  const paidAt = new Date().toISOString()
  try {
    await tutoringClient
      .patch(id)
      .ifRevisionId(inquiry._rev!)
      .set({ status: 'paid', paidAt, paymentProvider: session.provider, paymentRef: session.paymentRef })
      .commit()
  } catch {
    return { ...inquiry, status: 'paid' } // another request got there first
  }

  const paid = { ...inquiry, status: 'paid' as const, paidAt }
  const results = await Promise.allSettled([
    sendTutoringEmail({
      to: paid.email,
      subject: `Payment received: ${serviceTitle(paid.service)}`,
      html: paidStudentHtml(paid),
    }),
    sendTutoringEmail({
      to: TUTORING_STAFF_INBOX,
      replyTo: paid.email,
      subject: `Tutoring paid: ${paid.firstName} ${paid.lastName} ($${(paid.amount ?? 0).toFixed(2)})`,
      html: paidStaffHtml(paid),
    }),
  ])
  results.forEach(r => { if (r.status === 'rejected') console.error('Tutoring email error:', r.reason) })
  return paid
}
