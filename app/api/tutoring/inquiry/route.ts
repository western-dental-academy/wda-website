import { NextRequest } from 'next/server'
import { tutoringRatelimit } from '@/lib/ratelimit'
import { TUTORING_AREAS, TUTORING_FORMATS, serviceTitle } from '@/lib/tutoring/shared'
import {
  TUTORING_STAFF_INBOX,
  inquiryReceivedHtml,
  sendTutoringEmail,
  staffInquiryHtml,
  tutoringClient,
  type TutoringInquiryRecord,
} from '@/lib/tutoring/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const AREAS: string[] = [...TUTORING_AREAS]
const FORMATS: string[] = TUTORING_FORMATS.map(f => f.value)

const bad = (error: string, status = 400) => Response.json({ error }, { status })
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '')

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  try {
    const { success } = await tutoringRatelimit.limit(ip)
    if (!success) return bad('Too many requests. Please try again in a few minutes.', 429)
  } catch (err) {
    console.error('Tutoring rate limit unavailable:', err)
  }

  let b: Record<string, unknown>
  try {
    b = await req.json()
  } catch {
    return bad('Invalid JSON')
  }

  // Honeypot: real people never fill this hidden field
  if (clip(b.website, 200)) return Response.json({ success: true })

  const service = b.service === 'coaching' ? 'coaching' : b.service === 'tutoring' ? 'tutoring' : null
  const firstName = clip(b.firstName, 80)
  const lastName = clip(b.lastName, 80)
  const email = clip(b.email, 200)
  const areas = Array.isArray(b.areas)
    ? [...new Set(b.areas.filter((a): a is string => typeof a === 'string' && AREAS.includes(a)))]
    : []
  const otherArea = clip(b.otherArea, 120)
  const details = clip(b.details, 3000)
  const format = FORMATS.includes(String(b.format)) ? String(b.format) : 'either'

  if (!service) return bad('Please choose tutoring or coaching.')
  if (!firstName) return bad('First name is required.')
  if (!lastName) return bad('Last name is required.')
  if (!EMAIL_RE.test(email)) return bad('A valid email is required.')
  if (areas.length === 0 && !otherArea && !details) {
    return bad('Please tell us which areas you would like help with.')
  }

  try {
    const doc = await tutoringClient.create({
      _type: 'tutoringInquiry',
      service,
      firstName,
      lastName,
      email,
      phone: clip(b.phone, 40) || undefined,
      school: clip(b.school, 160) || undefined,
      stage: clip(b.stage, 160) || undefined,
      areas: otherArea ? [...areas, `Other: ${otherArea}`] : areas,
      details: details || undefined,
      format,
      availability: clip(b.availability, 1000) || undefined,
      submittedAt: new Date().toISOString(),
      status: 'new',
    })
    const inquiry = doc as unknown as TutoringInquiryRecord

    const results = await Promise.allSettled([
      sendTutoringEmail({
        to: TUTORING_STAFF_INBOX,
        replyTo: email,
        subject: `New ${service === 'coaching' ? 'Coaching' : 'Tutoring'} Inquiry: ${firstName} ${lastName}`,
        html: staffInquiryHtml(inquiry),
      }),
      sendTutoringEmail({
        to: email,
        subject: `We received your inquiry: ${serviceTitle(service)}`,
        html: inquiryReceivedHtml(inquiry),
      }),
    ])
    results.forEach(r => { if (r.status === 'rejected') console.error('Tutoring inquiry email error:', r.reason) })

    return Response.json({ success: true })
  } catch (err) {
    console.error('Tutoring inquiry error:', err)
    return bad('Something went wrong. Please try again.', 500)
  }
}
