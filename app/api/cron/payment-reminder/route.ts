import { createClient } from '@sanity/client'
import { Resend } from 'resend'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  // Verify this is called by Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find accepted students who haven't paid after 3 days
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const unpaidStudents = await client.fetch(
      `*[_type == "student" && status == "accepted" && paymentStatus == "unpaid" && acceptedDate < $cutoff]{
        _id, firstName, lastName, email, tuitionAmount,
        program->{ title }
      }`,
      { cutoff: threeDaysAgo.toISOString() }
    )

    if (unpaidStudents.length === 0) {
      return Response.json({ message: 'No reminders needed' })
    }

    // Send reminder to each unpaid student
    const results = await Promise.allSettled(
      unpaidStudents.map((student: any) =>
        resend.emails.send({
          from: 'Western Dental Academy <info@westerndentalacademy.com>',
          to: student.email,
          subject: `Reminder: Complete Your Enrolment — ${student.firstName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1E3560; padding: 32px;">
                <h1 style="color: white; margin: 0; font-size: 22px;">Complete Your Enrolment</h1>
                <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">Western Dental Academy</p>
              </div>
              
              <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e5e7eb;">
                <p style="color: #1E3560; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Hi ${student.firstName},</p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                  You have been accepted into the <strong>${student.program?.title ?? 'Dental Assisting Certificate'}</strong> programme 
                  at Western Dental Academy. To secure your spot and activate your course, please complete your tuition payment.
                </p>

                ${student.tuitionAmount ? `
                <div style="background-color: #F4F7F9; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">Tuition Amount</p>
                  <p style="color: #1E3560; font-size: 28px; font-weight: 700; margin: 0;">$${student.tuitionAmount.toLocaleString()} CAD</p>
                </div>
                ` : ''}

                <div style="text-align: center; margin-bottom: 24px;">
                  <a href="https://westerndentalacademy.com/portal" 
                     style="background-color: #E67E22; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
                    Pay Tuition Now
                  </a>
                </div>

                <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
                  If you have any questions about payment options or need assistance, please contact us at 
                  <a href="mailto:info@westerndentalacademy.com" style="color: #378ADD;">info@westerndentalacademy.com</a>.
                </p>
              </div>

              <div style="padding: 16px 32px; background-color: #F4F7F9; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Western Dental Academy — 150 Chippewa Road, Suite 258, Sherwood Park, AB
                </p>
              </div>
            </div>
          `,
        })
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return Response.json({
      success: true,
      message: `Sent ${sent} reminders, ${failed} failed`,
      total: unpaidStudents.length,
    })
  } catch (error) {
    console.error('Payment reminder cron error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}