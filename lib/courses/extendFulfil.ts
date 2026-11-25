// Course access extension fulfilment. Shared by /courses/extend/success and
// the payment webhooks. Safe to call more than once.
import { createClient } from '@sanity/client'
import { reactivateUserEnrollment } from '@/lib/moodle'
import type { CheckoutSession } from '@/lib/payments/checkout'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function fulfilCourseExtension(session: CheckoutSession): Promise<{ newExpiresAt: string; courseName: string } | null> {
  if (!session.paid) return null

  const m = session.metadata ?? {}
  const enrollmentId       = m.enrollmentId       ?? ''
  const accessDurationDays = parseInt(m.accessDurationDays ?? '365', 10)
  const courseName         = m.courseName         ?? 'your course'

  if (!enrollmentId) return null

  // Idempotency: skip if already processed
  const existing = await client.fetch<{
    extensionStripeSessionId?: string
    accessExpiresAt?: string
    status?: string
    moodleUserId?: number
    moodleCourseId?: number
  } | null>(
    `*[_id == $id][0]{ extensionStripeSessionId, accessExpiresAt, status, moodleUserId, "moodleCourseId": course->moodleCourseId }`,
    { id: enrollmentId }
  )

  let newExpiresAt: string

  if (existing?.extensionStripeSessionId === session.id && existing.accessExpiresAt) {
    newExpiresAt = existing.accessExpiresAt
  } else {
    const base = existing?.accessExpiresAt && new Date(existing.accessExpiresAt) > new Date()
      ? new Date(existing.accessExpiresAt)
      : new Date()

    const expiry = new Date(base.getTime() + accessDurationDays * 24 * 60 * 60 * 1000)
    newExpiresAt = expiry.toISOString()

    // Reactivate in Moodle if needed
    try {
      if (existing?.moodleUserId && existing.moodleCourseId) {
        await reactivateUserEnrollment(existing.moodleUserId, existing.moodleCourseId, expiry)
      }
    } catch (err) {
      console.error('Moodle reactivation error:', err)
    }

    await client.patch(enrollmentId).set({
      status:                    'active',
      accessExpiresAt:           newExpiresAt,
      extensionStripeSessionId:  session.id,
    }).commit()
  }

  return { newExpiresAt, courseName }
}
