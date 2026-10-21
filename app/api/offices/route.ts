import { createClient } from '@sanity/client'

export const dynamic = 'force-dynamic'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Public list for the "Which dental office do you work at?" picker — name and city only
export async function GET() {
  const offices = await client.fetch(
    `*[_type == "dentalOffice" && !(_id in path("drafts.**")) && active != false] | order(name asc){
      _id, name, city
    }`,
    {},
    { cache: 'no-store' }
  )
  return Response.json(offices)
}
