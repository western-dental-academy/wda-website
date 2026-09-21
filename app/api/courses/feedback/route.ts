import { NextRequest, NextResponse } from 'next/server'
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
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { token, rating, enjoyedMost, improvement, wouldRecommend, shareConsent } = body as {
    token?: string
    rating?: number
    enjoyedMost?: string
    improvement?: string
    wouldRecommend?: boolean
    shareConsent?: boolean
  }

  if (!token?.trim()) return NextResponse.json({ error: 'Token required' }, { status: 400 })
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })

  const enrollment = await client.fetch<{
    _id: string
    feedbackSubmittedAt?: string
  } | null>(
    `*[_type == "courseEnrollment" && !(_id in path("drafts.**")) && feedbackToken == "${token.trim()}"][0]{
      _id, feedbackSubmittedAt
    }`
  )

  if (!enrollment) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  if (enrollment.feedbackSubmittedAt) return NextResponse.json({ error: 'Feedback already submitted' }, { status: 400 })

  await client.patch(enrollment._id).set({
    feedbackRating:         rating,
    feedbackEnjoyedMost:    enjoyedMost?.trim() || undefined,
    feedbackImprovement:    improvement?.trim() || undefined,
    feedbackWouldRecommend: typeof wouldRecommend === 'boolean' ? wouldRecommend : undefined,
    feedbackShareConsent:   shareConsent === true,
    feedbackSubmittedAt:    new Date().toISOString(),
  }).commit()

  return NextResponse.json({ success: true })
}
