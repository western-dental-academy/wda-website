import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { getMoodleProgress, getMoodleCourseContents } from '@/lib/moodle/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all enrolled students with Moodle IDs
    const students = await client.fetch(
      `*[_type == "student" && (status == "accepted" || status == "enrolled") && defined(moodleUserId)]{
        _id, firstName, lastName, email, moodleUserId,
        program->{ title, moodleCourseId }
      }`
    )

    if (students.length === 0) {
      return Response.json({ message: 'No enrolled students' })
    }

    const results = await Promise.allSettled(
      students.map(async (student: any) => {
        const moodleCourseId = student.program?.moodleCourseId ?? Number(process.env.MOODLE_COURSE_DAC_DD)

        const [progress, courseContents] = await Promise.all([
          getMoodleProgress(student.moodleUserId, moodleCourseId),
          getMoodleCourseContents(moodleCourseId),
        ])

        // Build activity name map
        const activityNames: Record<number, string> = {}
        if (courseContents) {
          for (const section of courseContents) {
            for (const mod of section.modules ?? []) {
              activityNames[mod.id] = mod.name
            }
          }
        }

        const statuses = progress?.statuses ?? []
        const completedCount = statuses.filter((s: any) => s.state === 1).length
        const totalCount = statuses.length
        const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
        const incomplete = statuses.filter((s: any) => s.state !== 1)

        await resend.emails.send({
          from: 'Western Dental Academy <info@westerndentalacademy.com>',
          to: student.email,
          subject: `Your Weekly Progress Update — ${student.program?.title ?? 'Dental Assisting Certificate'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1E3560; padding: 32px;">
                <h1 style="color: white; margin: 0; font-size: 22px;">Weekly Progress Update</h1>
                <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">Western Dental Academy</p>
              </div>

              <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e5e7eb;">
                <p style="color: #1E3560; font-size: 15px; font-weight: 600; margin-bottom: 4px;">Hi ${student.firstName},</p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                  Here is your weekly progress summary for <strong>${student.program?.title ?? 'your programme'}</strong>.
                </p>

                <!-- Progress bar -->
                <div style="background-color: #F4F7F9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #1E3560; font-size: 13px; font-weight: 700;">Overall Progress</span>
                    <span style="color: #1E3560; font-size: 13px; font-weight: 700;">${progressPct}%</span>
                  </div>
                  <div style="background-color: #e5e7eb; border-radius: 4px; height: 8px;">
                    <div style="background-color: #378ADD; border-radius: 4px; height: 8px; width: ${progressPct}%;"></div>
                  </div>
                  <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0;">${completedCount} of ${totalCount} modules complete</p>
                </div>

                ${incomplete.length > 0 ? `
                <!-- Incomplete modules -->
                <div style="margin-bottom: 24px;">
                  <p style="color: #1E3560; font-size: 13px; font-weight: 700; margin-bottom: 12px;">Remaining Modules</p>
                  ${incomplete.map((item: any) => `
                    <div style="display: flex; align-items: center; padding: 10px 12px; border-bottom: 1px solid #f3f4f6;">
                      <span style="color: #6b7280; font-size: 13px;">○ ${activityNames[item.cmid] ?? item.modname}</span>
                    </div>
                  `).join('')}
                </div>
                ` : `
                <div style="background-color: rgba(34,197,94,0.08); border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
                  <p style="color: #16a34a; font-size: 14px; font-weight: 600; margin: 0;">🎉 Congratulations! You have completed all modules.</p>
                </div>
                `}

                <div style="text-align: center;">
                  <a href="https://westerndentalacademy.com/portal" 
                     style="background-color: #E67E22; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                    Go to My Course
                  </a>
                </div>
              </div>

              <div style="padding: 16px 32px; background-color: #F4F7F9; text-align: center;">
                <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                  Western Dental Academy — westerndentalacademy.com<br>
                  To stop receiving these emails, contact info@westerndentalacademy.com
                </p>
              </div>
            </div>
          `,
        })
      })
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return Response.json({
      success: true,
      message: `Sent ${sent} progress digests, ${failed} failed`,
      total: students.length,
    })
  } catch (error) {
    console.error('Progress digest cron error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}