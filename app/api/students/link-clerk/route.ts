import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'
import { auth, currentUser } from '@clerk/nextjs/server'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return Response.json({ error: 'No email on Clerk account' }, { status: 400 })
    }

    // Find student record by email
    const student = await client.fetch(
      `*[_type == "student" && email == $email][0]{ _id, clerkUserId }`,
      { email }
    )

    if (!student) {
      return Response.json({ error: 'No student record found for this email' }, { status: 404 })
    }

    // Already linked — nothing to do
    if (student.clerkUserId === userId) {
      return Response.json({ success: true, message: 'Already linked' })
    }

    // Save Clerk user ID to Sanity student record
    await client.patch(student._id).set({ clerkUserId: userId }).commit()

    return Response.json({ success: true, message: 'Clerk account linked to student record' })
  } catch (error) {
    console.error('Link Clerk error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}