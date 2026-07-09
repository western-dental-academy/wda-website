import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function linkClerkToStudent(userId: string, email: string) {
  try {
    const student = await client.fetch(
      `*[_type == "student" && email == $email][0]{ _id, clerkUserId }`,
      { email }
    )

    if (!student) return
    if (student.clerkUserId === userId) return

    await client.patch(student._id).set({ clerkUserId: userId }).commit()
  } catch (error) {
    console.error('Failed to link Clerk account:', error)
  }
}
