import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { moodleRequest, createMoodleUser, enrolMoodleUser, updateMoodleUser, addUserToMoodleCohort } from '@/lib/moodle/client'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { Resend } from 'resend'
import { createClerkClient } from '@clerk/backend'

const resend = new Resend(process.env.RESEND_API_KEY)
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    // Verify the webhook signature
    const signature = req.headers.get(SIGNATURE_HEADER_NAME) ?? ''
    const body = await req.text()

    const isValid = await isValidSignature(body, signature, WEBHOOK_SECRET)
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const { _id, status, firstName, lastName, email, phone, program } = payload

    // Handle rejection
if (status === 'rejected') {
  await resend.emails.send({
    from: 'Western Dental Academy <info@westerndentalacademy.com>',
    to: email,
    subject: `Your Application to Western Dental Academy`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1E3560; padding: 32px;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Western Dental Academy</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">Application Update</p>
        </div>
        <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e5e7eb;">
          <p style="color: #1E3560; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Dear ${firstName},</p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
            Thank you for your interest in Western Dental Academy and for taking the time to apply.
            After careful review, we are unable to offer you admission at this time.
          </p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
            We encourage you to reapply in a future intake. If you would like feedback on your application 
            or information about future opportunities, please don't hesitate to reach out to our admissions team.
          </p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            We wish you all the best in your future endeavours.
          </p>
          <a href="mailto:info@westerndentalacademy.com" 
             style="background-color: #1E3560; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
            Contact Admissions
          </a>
        </div>
        <div style="padding: 16px 32px; background-color: #F4F7F9; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Western Dental Academy — 150 Chippewa Road, Suite 258, Sherwood Park, AB</p>
        </div>
      </div>
    `,
  })
  return Response.json({ message: 'Rejection email sent' })
}

// Handle withdrawal
if (status === 'withdrawn') {
  // Fetch moodleUserId from Sanity
  const studentDoc = await client.fetch(
    `*[_id == $id][0]{ moodleUserId }`,
    { id: _id }
  )

  // Suspend Moodle account if exists
  if (studentDoc?.moodleUserId) {
    try {
      await updateMoodleUser(studentDoc.moodleUserId, { suspended: 1 })
    } catch (err) {
      console.error('Failed to suspend Moodle account:', err)
    }
  }

  await resend.emails.send({
    from: 'Western Dental Academy <info@westerndentalacademy.com>',
    to: email,
    subject: `Your Enrolment at Western Dental Academy`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1E3560; padding: 32px;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Western Dental Academy</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">Enrolment Update</p>
        </div>
        <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e5e7eb;">
          <p style="color: #1E3560; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Dear ${firstName},</p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
            We are writing to confirm that your withdrawal from Western Dental Academy has been processed.
            Your access to course materials has been deactivated.
          </p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            If you wish to re-enrol in the future or have any questions about your withdrawal, 
            please contact our admissions team — we would be happy to assist you.
          </p>
          <a href="mailto:info@westerndentalacademy.com" 
             style="background-color: #1E3560; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
            Contact Us
          </a>
        </div>
        <div style="padding: 16px 32px; background-color: #F4F7F9; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Western Dental Academy — 150 Chippewa Road, Suite 258, Sherwood Park, AB</p>
        </div>
      </div>
    `,
  })
  return Response.json({ message: 'Withdrawal email sent' })
}

// Only continue with provisioning for accepted students
if (status !== 'accepted') {
  return Response.json({ message: 'No action needed' })
}

    // Prevent re-provisioning if already done — stops webhook loop
    const existingStudent = await client.fetch(
      `*[_id == $id][0]{ moodleUserId, clerkUserId }`,
      { id: _id }
    )
    if (existingStudent?.moodleUserId) {
      return Response.json({ message: 'Already provisioned — skipping' })
    }

    // Create or find Clerk account for student
    let clerkUserId: string | null = null
    try {
      const existingUsers = await clerkClient.users.getUserList({ emailAddress: [email] })

      if (existingUsers.totalCount > 0) {
        clerkUserId = existingUsers.data[0].id
      } else {
        const newUser = await clerkClient.users.createUser({
          emailAddress: [email],
          firstName,
          lastName,
          password: `WDA_${Date.now()}!`,
          skipPasswordChecks: true,
        })
        clerkUserId = newUser.id

        await clerkClient.users.updateUser(newUser.id, {
          skipPasswordChecks: true,
        })

        // Create a sign-in token so the student can set up their account
        await clerkClient.users.createUserSignInToken({
          userId: clerkUserId,
        })
      }
    } catch (err) {
      console.error('Failed to create Clerk account:', err)
    }

    // Get the program to find the Moodle course ID and tuition amount
const programDoc = program?._ref
  ? await client.fetch(`*[_id == $id][0]{ moodleCourseId, tuitionAmount, title }`, { id: program._ref })
  : null

const moodleCourseId = programDoc?.moodleCourseId ?? Number(process.env.MOODLE_COURSE_DAC_DD)
const tuitionAmount = programDoc?.tuitionAmount ?? null

    // Check if Moodle user already exists
    let moodleUserId: number

    const existingUsers = await moodleRequest('core_user_get_users', {
      'criteria[0][key]': 'email',
      'criteria[0][value]': email,
    })

    if (existingUsers?.users?.length > 0) {
      moodleUserId = existingUsers.users[0].id
    } else {
      // Create new Moodle user
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
      const newUsers = await createMoodleUser({
        username: `${username}_${Date.now()}`,
        password: `Wda${Date.now()}!`,
        firstname: firstName,
        lastname: lastName,
        email,
      })
      moodleUserId = newUsers[0].id
    }

    // Enrol in Moodle course
    await enrolMoodleUser(moodleUserId, moodleCourseId)

    // Add to cohort if specified on student record
    if (payload.cohort) {
      try {
        await addUserToMoodleCohort(moodleUserId, payload.cohort)
      } catch (err) {
        console.error('Failed to add student to cohort:', err)
      }
    }

    // Store moodleUserId (and clerkUserId if newly created) back on Sanity student record
    await client.patch(_id).set({
  moodleUserId,
  acceptedDate: new Date().toISOString(),
  ...(tuitionAmount ? { tuitionAmount } : {}),
  ...(clerkUserId ? { clerkUserId } : {}),
}).commit()
// Send welcome email to student
    await resend.emails.send({
      from: 'Western Dental Academy <info@westerndentalacademy.com>',
      to: email,
      subject: `Welcome to Western Dental Academy, ${firstName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1E3560; padding: 32px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Western Dental Academy</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">Your application has been accepted</p>
          </div>
          
          <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e5e7eb;">
            <p style="color: #1E3560; font-size: 16px; font-weight: 600; margin-bottom: 8px;">Congratulations, ${firstName}!</p>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              We are thrilled to welcome you to the <strong>${programDoc?.title ?? 'Dental Assisting Certificate'}</strong> programme at Western Dental Academy. 
              Your application has been reviewed and accepted by our admissions team.
            </p>

            <div style="background-color: #F4F7F9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="color: #1E3560; font-size: 13px; font-weight: 700; margin: 0 0 12px;">How to Access Your Student Portal</p>
              <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Click the button below to go to the sign-in page</li>
                <li>Click <strong>Forgot password?</strong> and enter your email address</li>
                <li>Check your email for a password reset link</li>
                <li>Set your password and you will be taken to your student portal</li>
              </ol>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://westerndentalacademy.com/sign-in"
                 style="background-color: #E67E22; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
                Set Up Your Portal Access
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
              If you have any questions, please don't hesitate to reach out to our admissions team at 
              <a href="mailto:info@westerndentalacademy.com" style="color: #378ADD;">info@westerndentalacademy.com</a>.
              We are here to support you throughout your journey.
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

    return Response.json({
      success: true,
      message: `Student ${firstName} ${lastName} provisioned in Moodle`,
      moodleUserId,
    })
  } catch (error) {
    console.error('Sanity webhook error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}