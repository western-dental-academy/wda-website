import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { auth, currentUser } from '@clerk/nextjs/server'
import { TUTORING_HOURLY_RATE, TUTORING_MAX_HOURS, serviceTitle, type TutoringStatus } from '@/lib/tutoring/shared'
import { getInquiry, paymentRequestHtml, sendTutoringEmail, siteUrl, tutoringClient } from '@/lib/tutoring/server'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'lance@westerndentalacademy.com',
  'ryan@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'amber@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

const STATUSES: TutoringStatus[] = ['new', 'contacted', 'payment-requested', 'paid', 'closed']
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '')
const bad = (error: string, status = 400) => Response.json({ error }, { status })

// POST { action: 'update', id, status?, assignedTo?, staffNotes? }
// POST { action: 'request-payment', id, hours, sessionDetails, assignedTo? }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return bad('Unauthorized', 401)
  const user = await currentUser()
  const staffEmail = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(staffEmail)) return bad('Forbidden', 403)

  let b: Record<string, unknown>
  try {
    b = await req.json()
  } catch {
    return bad('Invalid JSON')
  }

  const id = clip(b.id, 100)
  const inquiry = id ? await getInquiry(id) : null
  if (!inquiry) return bad('Inquiry not found.', 404)

  if (b.action === 'update') {
    const set: Record<string, unknown> = {}
    if (typeof b.status === 'string') {
      if (!STATUSES.includes(b.status as TutoringStatus)) return bad('Unknown status.')
      if (b.status === 'paid' && inquiry.status !== 'paid') set.paidAt = new Date().toISOString()
      set.status = b.status
    }
    if (typeof b.assignedTo === 'string') set.assignedTo = clip(b.assignedTo, 120)
    if (typeof b.staffNotes === 'string') set.staffNotes = clip(b.staffNotes, 4000)
    await tutoringClient.patch(id).set(set).commit()
    return Response.json({ success: true, inquiry: { ...inquiry, ...set } })
  }

  if (b.action === 'request-payment') {
    if (inquiry.status === 'paid') return bad('This inquiry is already paid.')
    const hours = Number(b.hours)
    if (!Number.isFinite(hours) || hours <= 0 || hours > TUTORING_MAX_HOURS || Math.round(hours * 2) !== hours * 2) {
      return bad(`Hours must be between 0.5 and ${TUTORING_MAX_HOURS}, in half-hour steps.`)
    }
    const sessionDetails = clip(b.sessionDetails, 1000)
    if (!sessionDetails) return bad('Please add the session dates, times and format.')
    const assignedTo = typeof b.assignedTo === 'string' ? clip(b.assignedTo, 120) : inquiry.assignedTo

    const set = {
      hours,
      amount: hours * TUTORING_HOURLY_RATE,
      sessionDetails,
      assignedTo: assignedTo || undefined,
      payToken: randomUUID(),
      paymentRequestedAt: new Date().toISOString(),
      paymentRequestedBy: staffEmail,
      status: 'payment-requested' as const,
    }
    await tutoringClient.patch(id).set(set).unset(['checkoutSessionId']).commit()

    const updated = { ...inquiry, ...set }
    const payUrl = `${siteUrl()}/tutoring/pay/${id}?t=${set.payToken}`
    try {
      await sendTutoringEmail({
        to: inquiry.email,
        replyTo: 'info@westerndentalacademy.com',
        subject: `Your ${serviceTitle(inquiry.service)} session: payment link`,
        html: paymentRequestHtml(updated, payUrl),
      })
    } catch (err) {
      console.error('Tutoring payment request email error:', err)
      return Response.json({ success: true, emailed: false, payUrl, inquiry: updated })
    }
    return Response.json({ success: true, emailed: true, payUrl, inquiry: updated })
  }

  return bad('Unknown action.')
}
