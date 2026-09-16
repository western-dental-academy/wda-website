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

  const {
    workshopDateId,
    workshopName,
    rating,
    enjoyedMost,
    improvement,
    wouldRecommend,
    shareConsent,
    respondentName,
    source,
    registrationId,
    token,
  } = body as {
    workshopDateId?: string
    workshopName?: string
    rating?: number
    enjoyedMost?: string
    improvement?: string
    wouldRecommend?: boolean
    shareConsent?: boolean
    respondentName?: string
    source?: string
    registrationId?: string
    token?: string
  }

  if (!workshopDateId?.trim()) {
    return Response.json({ error: 'workshopDateId is required' }, { status: 400 })
  }
  if (!rating || rating < 1 || rating > 5) {
    return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  // For email-link submissions: validate token and guard against resubmission
  if (source === 'email-link' && token?.trim()) {
    const reg = await client.fetch<{ _id: string; feedbackSubmittedAt?: string } | null>(
      `*[_type == "workshopRegistration" && !(_id in path("drafts.**")) && feedbackToken == "${token}"][0]{
        _id, feedbackSubmittedAt
      }`
    )
    if (!reg) {
      return Response.json({ error: 'Invalid or expired feedback link' }, { status: 404 })
    }
    if (reg.feedbackSubmittedAt) {
      return Response.json({ error: 'Feedback already submitted' }, { status: 400 })
    }
    // Mark feedbackSubmittedAt to prevent resubmission
    await client.patch(reg._id).set({ feedbackSubmittedAt: new Date().toISOString() }).commit()
  }

  await client.create({
    _type: 'workshopFeedback',
    workshopDateId:      workshopDateId.trim(),
    workshopName:        workshopName?.trim() || undefined,
    rating,
    enjoyedMost:         enjoyedMost?.trim()  || undefined,
    improvement:         improvement?.trim()  || undefined,
    wouldRecommend:      typeof wouldRecommend === 'boolean' ? wouldRecommend : undefined,
    feedbackShareConsent: shareConsent === true ? true : undefined,
    submittedAt:         new Date().toISOString(),
    respondentName:      respondentName?.trim() || undefined,
    source:              source?.trim() || 'qr-code',
    registrationId:      registrationId?.trim() || undefined,
  } as { _type: string; [key: string]: unknown })

  return Response.json({ success: true })
}
