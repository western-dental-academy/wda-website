import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { token, rating, enjoyedMost, improvement, wouldRecommend } = body as {
    token?: string
    rating?: number
    enjoyedMost?: string
    improvement?: string
    wouldRecommend?: boolean
  }

  if (!token?.trim()) {
    return Response.json({ error: 'Token is required' }, { status: 400 })
  }
  if (!rating || rating < 1 || rating > 5) {
    return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  const registration = await client.fetch<{
    _id: string
    feedbackSubmittedAt?: string
  } | null>(
    `*[_type == "workshopRegistration" && feedbackToken == $token][0]{ _id, feedbackSubmittedAt }`,
    { token: token }
  )

  if (!registration) {
    return Response.json({ error: 'Invalid or expired feedback link' }, { status: 404 })
  }

  if (registration.feedbackSubmittedAt) {
    return Response.json({ error: 'Feedback already submitted' }, { status: 400 })
  }

  await client.patch(registration._id).set({
    feedbackRating: rating,
    feedbackEnjoyedMost: enjoyedMost?.trim() || undefined,
    feedbackImprovement: improvement?.trim() || undefined,
    feedbackWouldRecommend: typeof wouldRecommend === 'boolean' ? wouldRecommend : undefined,
    feedbackSubmittedAt: new Date().toISOString(),
  }).commit()

  return Response.json({ success: true })
}
