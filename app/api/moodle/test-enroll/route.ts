import { createMoodleUser, enrolMoodleUser } from '@/lib/moodle/client'

export async function GET() {
  try {
    const newUsers = await createMoodleUser({
      username: 'teststudent2',
      password: 'Test1234!',
      firstname: 'Test',
      lastname: 'Student',
      email: 'teststudent2@westerndentalacademy.com',
    })

    const moodleUserId = newUsers[0].id

    await enrolMoodleUser(moodleUserId, 2)

    return Response.json({
      success: true,
      moodleUserId,
      message: `User created and enrolled in DAC-DD`,
    })
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}