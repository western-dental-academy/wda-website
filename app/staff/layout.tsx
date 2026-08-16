import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=%2Fstaff')

  const staff = await client.fetch(
    `*[_type == "staffMember" && clerkUserId == $uid && active == true][0]{ _id }`,
    { uid: userId }
  )
  if (!staff) redirect('/')

  return <>{children}</>
}
