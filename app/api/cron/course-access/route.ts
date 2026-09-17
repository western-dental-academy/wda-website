import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { suspendUserEnrollment } from '@/lib/moodle'

export const dynamic = 'force-dynamic'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const resend = new Resend(process.env.RESEND_API_KEY)

interface Enrollment {
  _id: string
  status: string
  accessExpiresAt: string
  moodleUserId?: number
  moodleCourseId?: number
  courseName?: string
  studentEmail?: string
  studentFirstName?: string
  lastReminderSentAt?: string
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Fetch all active enrollments
  const enrollments = await client.fetch<Enrollment[]>(
    `*[_type == "courseEnrollment" && !(_id in path("drafts.**")) && status == "active"]{
      _id, status, accessExpiresAt, moodleUserId, lastReminderSentAt,
      "moodleCourseId": course->moodleCourseId,
      "courseName": courseName,
      "studentEmail": student.email,
      "studentFirstName": student.firstName
    }`
  )

  const expired: string[]   = []
  const reminded: string[]  = []
  const errors: string[]    = []

  for (const enrollment of enrollments) {
    if (!enrollment.accessExpiresAt) continue
    const expiresAt = new Date(enrollment.accessExpiresAt)

    if (expiresAt <= now) {
      // Suspend Moodle access
      try {
        if (enrollment.moodleUserId && enrollment.moodleCourseId) {
          await suspendUserEnrollment(enrollment.moodleUserId, enrollment.moodleCourseId)
        }
        await client.patch(enrollment._id).set({ status: 'expired' }).commit()
        expired.push(enrollment._id)

        // Send expiry notification
        if (enrollment.studentEmail) {
          await resend.emails.send({
            from: 'Western Dental Academy <info@westerndentalacademy.com>',
            to: enrollment.studentEmail,
            subject: `Your access to ${enrollment.courseName ?? 'your course'} has expired`,
            html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background-color:#0D3B6E;padding:28px 32px;">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Course Access Expired</h1>
    <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
  </div>
  <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
    <p style="color:#0D3B6E;font-size:15px;margin:0 0 16px;">Hi ${enrollment.studentFirstName ?? 'there'},</p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Your access to <strong>${enrollment.courseName ?? 'your course'}</strong> has expired.
      If you would like to continue your studies, you can purchase an extension below.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://westerndentalacademy.com/professional-development"
         style="display:inline-block;background-color:#E67E22;color:#ffffff;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:bold;text-decoration:none;">
        View Courses
      </a>
    </div>
  </div>
  <div style="padding:16px 32px;background:#F4F7F9;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
  </div>
</div>`,
          }).catch(() => {})
        }
      } catch (err) {
        errors.push(`${enrollment._id}: ${String(err)}`)
      }
    } else if (expiresAt <= sevenDaysOut) {
      // 7-day reminder — only send once
      const alreadySent = enrollment.lastReminderSentAt
        ? new Date(enrollment.lastReminderSentAt) > new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
        : false

      if (!alreadySent && enrollment.studentEmail) {
        const expiryDisplay = expiresAt.toLocaleDateString('en-CA', {
          year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Edmonton',
        })
        try {
          await resend.emails.send({
            from: 'Western Dental Academy <info@westerndentalacademy.com>',
            to: enrollment.studentEmail,
            subject: `Your access to ${enrollment.courseName ?? 'your course'} expires soon`,
            html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background-color:#0D3B6E;padding:28px 32px;">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Course Access Expiring Soon</h1>
    <p style="color:rgba(255,255,255,0.5);margin:8px 0 0;font-size:13px;">Western Dental Academy</p>
  </div>
  <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;">
    <p style="color:#0D3B6E;font-size:15px;margin:0 0 16px;">Hi ${enrollment.studentFirstName ?? 'there'},</p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Your access to <strong>${enrollment.courseName ?? 'your course'}</strong> expires on <strong>${expiryDisplay}</strong>.
      Don&rsquo;t forget to complete the course before your access ends.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://learn.westerndentalacademy.com"
         style="display:inline-block;background-color:#0D3B6E;color:#ffffff;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:bold;text-decoration:none;">
        Continue Course →
      </a>
    </div>
  </div>
  <div style="padding:16px 32px;background:#F4F7F9;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;">Western Dental Academy — westerndentalacademy.com</p>
  </div>
</div>`,
          })
          await client.patch(enrollment._id).set({ lastReminderSentAt: now.toISOString() }).commit()
          reminded.push(enrollment._id)
        } catch (err) {
          errors.push(`reminder-${enrollment._id}: ${String(err)}`)
        }
      }
    }
  }

  return Response.json({ expired, reminded, errors, checkedAt: now.toISOString() })
}
