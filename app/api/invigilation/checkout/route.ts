import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import {
  ACCOMMODATION_OPTIONS,
  HOLD_MINUTES,
  bookingPrice,
  computeSlots,
  formatDateLong,
  formatTimeRange,
  isDateBookable,
  lengthsFor,
} from '@/lib/invigilation/settings'
import { getBookingsForDate, getInvigilationSettings, invigilationClient } from '@/lib/invigilation/server'

interface BookingPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  date: string
  startTime: string
  durationHours: number
  institution: string
  examName: string
  examFormat: 'computer' | 'paper'
  accommodations: string[]
  accommodationNotes?: string
  instructorName: string
  instructorEmail: string
  instructorPhone?: string
  notes?: string
  policyAgreed: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_ACCOMMODATIONS: string[] = ACCOMMODATION_OPTIONS.map(o => o.value)

// Same card fee as workshop checkout (3.3% + $0.30)
function calcFee(subtotalCents: number): number {
  return Math.round((subtotalCents + 30) / (1 - 0.033) - subtotalCents)
}

const bad = (error: string, status = 400) => Response.json({ error }, { status })

export async function POST(req: NextRequest) {
  let b: BookingPayload
  try {
    b = (await req.json()) as BookingPayload
  } catch {
    return bad('Invalid JSON')
  }

  try {
    if (!b.firstName?.trim()) return bad('First name is required.')
    if (!b.lastName?.trim()) return bad('Last name is required.')
    if (!EMAIL_RE.test(b.email?.trim() ?? '')) return bad('A valid email is required.')
    if (!b.phone?.trim()) return bad('Phone number is required.')
    if (!b.institution?.trim()) return bad('Institution is required.')
    if (!b.examName?.trim()) return bad('Exam name is required.')
    if (b.examFormat !== 'computer' && b.examFormat !== 'paper') return bad('Exam format is required.')
    if (!b.instructorName?.trim()) return bad('Instructor or exam centre contact is required.')
    if (!EMAIL_RE.test(b.instructorEmail?.trim() ?? '')) return bad('A valid instructor email is required.')
    if (!b.policyAgreed) return bad('Please confirm you have read the invigilation policies.')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date ?? '')) return bad('Please choose a date.')
    if (!/^\d{2}:00$/.test(b.startTime ?? '')) return bad('Please choose a start time.')

    const accommodations = Array.isArray(b.accommodations)
      ? [...new Set(b.accommodations.filter(a => VALID_ACCOMMODATIONS.includes(a)))]
      : []
    if (accommodations.includes('other') && !b.accommodationNotes?.trim()) {
      return bad('Please describe the accommodation you need.')
    }
    const exclusive = accommodations.length > 0

    const settings = await getInvigilationSettings()
    if (!lengthsFor(settings, accommodations).includes(b.durationHours)) {
      return bad(accommodations.includes('extra-time')
        ? 'Students with extra time need a session of at least 2 hours.'
        : 'Please choose a session length.')
    }
    if (!isDateBookable(settings, b.date)) {
      return bad(`That date isn't available. Exams must be booked at least ${settings.minDaysNotice} days ahead.`)
    }

    // Re-check the slot against live bookings
    const slots = computeSlots(settings, b.date, await getBookingsForDate(b.date))
    const slot = slots.find(s => s.start === b.startTime)
    const duration = b.durationHours
    const ok = slot && (exclusive ? slot.exclusive[duration] : slot.shared[duration])
    if (!ok) {
      return bad('Sorry, that time was just booked. Please pick another time.', 409)
    }

    const price = bookingPrice(settings, accommodations)
    const holdExpiresAt = Math.floor(Date.now() / 1000) + HOLD_MINUTES * 60 + 60

    const doc = await invigilationClient.create({
      _type: 'invigilationBooking',
      firstName: b.firstName.trim(),
      lastName: b.lastName.trim(),
      email: b.email.trim(),
      phone: b.phone.trim(),
      date: b.date,
      startTime: b.startTime,
      durationHours: b.durationHours,
      institution: b.institution.trim(),
      examName: b.examName.trim(),
      examFormat: b.examFormat,
      accommodations,
      accommodationNotes: b.accommodationNotes?.trim() || undefined,
      instructorName: b.instructorName.trim(),
      instructorEmail: b.instructorEmail.trim(),
      instructorPhone: b.instructorPhone?.trim() || undefined,
      notes: b.notes?.trim() || undefined,
      price,
      stripePaymentStatus: 'unpaid',
      status: 'booked',
      bookedAt: new Date().toISOString(),
    })

    const when = `${formatDateLong(b.date)}, ${formatTimeRange(b.startTime, b.durationHours)}`
    const lineItems = [
      {
        price_data: {
          currency: 'cad',
          product_data: {
            name: `Exam Invigilation — ${b.firstName.trim()} ${b.lastName.trim()}`,
            description: `${when} (${b.durationHours} hr session)`,
          },
          unit_amount: settings.sessionPrice * 100,
        },
        quantity: 1,
      },
      ...(accommodations.includes('verbal-reader') && settings.verbalReaderPrice > 0
        ? [{
            price_data: {
              currency: 'cad',
              product_data: { name: 'Verbal Exam Reader', description: 'Accommodation fee' },
              unit_amount: settings.verbalReaderPrice * 100,
            },
            quantity: 1,
          }]
        : []),
      {
        price_data: {
          currency: 'cad',
          product_data: {
            name: 'Payment Processing Fee',
            description: 'Credit/debit card processing fee (3.3% + $0.30)',
          },
          unit_amount: calcFee(price * 100),
        },
        quantity: 1,
      },
    ]

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://westerndentalacademy.com'
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: b.email.trim(),
      line_items: lineItems,
      mode: 'payment',
      expires_at: holdExpiresAt,
      success_url: `${siteUrl}/exam-invigilation/success?session_id={CHECKOUT_SESSION_ID}&id=${doc._id}`,
      cancel_url: `${siteUrl}/exam-invigilation?cancelled=1`,
      metadata: {
        invigilationBookingId: doc._id,
        examDate: b.date,
        startTime: b.startTime,
      },
    })

    await invigilationClient.patch(doc._id).set({ stripeSessionId: session.id }).commit()

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Invigilation checkout error:', error)
    return bad('Something went wrong starting checkout. Please try again or call 780-499-9153.', 500)
  }
}
