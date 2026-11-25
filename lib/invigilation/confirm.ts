import { Resend } from 'resend'
import { getCheckoutSession } from '@/lib/payments/checkout'
import { invigilationClient } from './server'
import {
  adminInvigilationHtml,
  studentConfirmationHtml,
  type InvigilationBookingRecord,
} from './emails'
import { formatDateLong, formatTimeRange } from './settings'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Western Dental Academy <info@westerndentalacademy.com>'

// Marks a booking paid and sends the confirmation emails. Called from both the
// success page and the payment webhooks (Stripe and Clover), so a student who closes the tab before
// the redirect still gets their booking. Safe to call more than once.
export async function confirmInvigilationBooking(sessionId: string, id: string): Promise<InvigilationBookingRecord | null> {
  const booking = await invigilationClient.fetch<(InvigilationBookingRecord & { _rev: string; stripeSessionId?: string }) | null>(
    `*[_type == "invigilationBooking" && _id == $id && !(_id in path("drafts.**"))][0]`,
    { id },
  )
  if (!booking || booking.stripeSessionId !== sessionId) return null
  if (booking.stripePaymentStatus === 'paid') return booking // already processed

  const session = await getCheckoutSession(sessionId)
  if (!session?.paid) return null

  // ifRevisionId makes sure only one request sends the emails
  try {
    await invigilationClient
      .patch(id)
      .ifRevisionId(booking._rev)
      .set(session.provider === 'clover'
        ? { stripePaymentStatus: 'paid', paymentProvider: 'clover', cloverPaymentId: session.paymentRef }
        : { stripePaymentStatus: 'paid', stripePaymentIntentId: session.paymentRef })
      .commit()
  } catch {
    return { ...booking, stripePaymentStatus: 'paid' }
  }

  const when = `${formatDateLong(booking.date)}, ${formatTimeRange(booking.startTime, booking.durationHours)}`
  const sends = [
    resend.emails.send({
      from: FROM,
      to: booking.email,
      subject: `Exam Invigilation Booked — ${when}`,
      html: studentConfirmationHtml(booking),
    }),
    resend.emails.send({
      from: FROM,
      to: 'info@westerndentalacademy.com',
      replyTo: booking.email,
      subject: `New Exam Invigilation: ${booking.firstName} ${booking.lastName} — ${when}`,
      html: adminInvigilationHtml(booking),
    }),
  ]
  const results = await Promise.allSettled(sends)
  results.forEach(r => {
    if (r.status === 'rejected') console.error('Invigilation email error:', r.reason)
  })

  return { ...booking, stripePaymentStatus: 'paid' }
}
