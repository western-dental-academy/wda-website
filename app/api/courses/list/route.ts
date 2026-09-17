import { createClient } from '@sanity/client'

export const dynamic = 'force-dynamic'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function GET() {
  const courses = await client.fetch(
    `*[_type == "onlineCourse" && !(_id in path("drafts.**")) && active == true] | order(title asc){
      _id, title, description, price, moodleCourseId, accessDurationDays, hours
    }`,
    {},
    { cache: 'no-store' }
  )
  return Response.json(courses)
}
