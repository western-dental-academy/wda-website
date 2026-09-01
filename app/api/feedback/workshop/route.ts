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

  const { workshopDateId, workshopName, rating, enjoyedMost, improvement, wouldRecommend } = body as {
    workshopDateId?: string
    workshopName?: string
    rating?: number
    enjoyedMost?: string
    improvement?: string
    wouldRecommend?: boolean
  }

  if (!workshopDateId?.trim()) {
    return Response.json({ error: 'workshopDateId is required' }, { status: 400 })
  }
  if (!rating || rating < 1 || rating > 5) {
    return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  await client.create({
    _type: 'workshopFeedback',
    workshopDateId: workshopDateId.trim(),
    workshopName:   workshopName?.trim() || undefined,
    rating,
    enjoyedMost:    enjoyedMost?.trim()  || undefined,
    improvement:    improvement?.trim()  || undefined,
    wouldRecommend: typeof wouldRecommend === 'boolean' ? wouldRecommend : undefined,
    submittedAt:    new Date().toISOString(),
  } as { _type: string; [key: string]: unknown })

  return Response.json({ success: true })
}
