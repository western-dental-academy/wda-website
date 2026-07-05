import { getMoodleCourses } from '@/lib/moodle/client'

export async function GET() {
  try {
    const courses = await getMoodleCourses()
    return Response.json({ success: true, courses })
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}