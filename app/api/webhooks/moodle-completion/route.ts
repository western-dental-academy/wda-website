import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { generateCompletionCertificate } from '@/lib/courses/completionCertificate'

export const dynamic = 'force-dynamic'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  // Simple shared-secret auth for Moodle webhook
  const secret = req.headers.get('x-moodle-secret')
  if (!secret || secret !== process.env.MOODLE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { moodleUserId, moodleCourseId } = body as {
    moodleUserId?: number
    moodleCourseId?: number
  }

  if (!moodleUserId || !moodleCourseId) {
    return Response.json({ error: 'moodleUserId and moodleCourseId are required.' }, { status: 400 })
  }

  // Find the active or extended enrollment
  const enrollment = await client.fetch<{
    _id: string
    status: string
    completedAt?: string
    certificateSent: boolean
    courseName: string
    student: { firstName: string; lastName: string; email: string }
    courseHours?: number
  } | null>(
    `*[_type == "courseEnrollment" && !(_id in path("drafts.**"))
       && moodleUserId == $uid
       && course->moodleCourseId == $cid
       && status in ["active", "extended"]][0]{
      _id, status, completedAt, certificateSent, courseName,
      student{ firstName, lastName, email },
      "courseHours": course->hours
    }`,
    { uid: moodleUserId, cid: moodleCourseId }
  )

  if (!enrollment) {
    return Response.json({ error: 'Enrollment not found.' }, { status: 404 })
  }

  // Idempotent
  if (enrollment.completedAt && enrollment.certificateSent) {
    return Response.json({ success: true, alreadyProcessed: true })
  }

  const completedAt    = new Date().toISOString()
  const hours          = enrollment.courseHours ?? 0
  const feedbackToken  = crypto.randomUUID()
  const SITE_URL       = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://westerndentalacademy.com'
  const feedbackUrl    = `${SITE_URL}/courses/feedback?token=${feedbackToken}`

  // Generate certificate PDF
  let pdfBuffer: Buffer | null = null
  try {
    pdfBuffer = await generateCompletionCertificate({
      firstName:   enrollment.student.firstName,
      lastName:    enrollment.student.lastName,
      courseName:  enrollment.courseName,
      completedAt,
      hours,
    })
  } catch (err) {
    console.error('Completion certificate generation error:', err)
  }

  // Update enrollment
  await client.patch(enrollment._id).set({
    status:          'completed',
    completedAt,
    certificateSent: pdfBuffer != null,
    feedbackToken,
  }).commit()

  // Email certificate
  if (pdfBuffer && enrollment.student.email) {
    try {
      await resend.emails.send({
        from: 'Western Dental Academy <info@westerndentalacademy.com>',
        to: enrollment.student.email,
        subject: `Certificate of Completion — ${enrollment.courseName}`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background-color:#0D3B6E;padding:28px 32px;">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Certificate of Completion</h1>
    <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
  </div>
  <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
    <p style="color:#0D3B6E;font-size:15px;margin:0 0 16px;">Hi ${enrollment.student.firstName},</p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Congratulations on completing <strong>${enrollment.courseName}</strong>!
      Your Certificate of Completion is attached to this email.
    </p>
    <p style="color:#374151;font-size:13px;line-height:1.6;margin:0 0 24px;">
      Questions? <a href="mailto:info@westerndentalacademy.com" style="color:#378ADD;">info@westerndentalacademy.com</a>
    </p>
    <div style="border-top:1px solid #e5e7eb;padding-top:24px;text-align:center;">
      <p style="color:#0D3B6E;font-size:15px;font-weight:700;margin:0 0 8px;">How was your experience?</p>
      <p style="color:#6b7280;font-size:13px;margin:0 0 20px;">Your feedback helps us improve our courses — it only takes 30 seconds.</p>
      <a
        href="${feedbackUrl}"
        style="display:inline-block;background-color:#E67E22;color:#ffffff;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:700;text-decoration:none;"
      >
        Share Your Feedback →
      </a>
    </div>
  </div>
  <div style="padding:16px 32px;background:#F4F7F9;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
  </div>
</div>`,
        attachments: [
          {
            filename: `WDA-Certificate-${enrollment.student.firstName}-${enrollment.student.lastName}.pdf`,
            content: pdfBuffer,
          },
        ],
      })
    } catch (err) {
      console.error('Completion email error:', err)
    }
  }

  return Response.json({ success: true, enrollmentId: enrollment._id })
}
