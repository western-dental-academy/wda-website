import { createClient } from '@sanity/client'
import Image from 'next/image'
import CourseFeedbackFormClient from '@/components/CourseFeedbackFormClient'

export const dynamic = 'force-dynamic'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export const metadata = {
  title: 'Course Feedback',
  robots: { index: false },
}

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function CourseFeedbackPage({ searchParams }: PageProps) {
  const { token } = await searchParams

  let state: 'invalid' | 'already-submitted' | 'valid' = 'invalid'
  let firstName  = ''
  let courseName = ''

  if (token?.trim()) {
    const enrollment = await client.fetch<{
      _id: string
      feedbackSubmittedAt?: string
      courseName: string
      student: { firstName: string }
    } | null>(
      `*[_type == "courseEnrollment" && !(_id in path("drafts.**")) && feedbackToken == "${token.trim()}"][0]{
        _id, feedbackSubmittedAt,
        "courseName": courseName,
        student { firstName }
      }`
    )

    if (enrollment) {
      firstName  = enrollment.student.firstName
      courseName = enrollment.courseName
      state      = enrollment.feedbackSubmittedAt ? 'already-submitted' : 'valid'
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#0D3B6E' }} className="px-6 py-6">
        <div className="max-w-lg mx-auto">
          <Image
            src="/Western Dental Academy Logo - Alternate - Inverted.svg"
            alt="Western Dental Academy"
            width={160}
            height={48}
            style={{ height: 40, width: 'auto' }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="rounded-2xl bg-white p-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
          {state === 'invalid' && (
            <div className="text-center py-6">
              <p className="text-base font-semibold mb-2" style={{ color: '#0D3B6E' }}>
                Invalid feedback link
              </p>
              <p className="text-sm" style={{ color: 'rgba(43,48,58,0.55)' }}>
                This feedback link is invalid or has already been used.
              </p>
            </div>
          )}

          {state === 'already-submitted' && (
            <div className="text-center py-6">
              <p className="text-base font-semibold mb-2" style={{ color: '#0D3B6E' }}>
                Feedback already received
              </p>
              <p className="text-sm" style={{ color: 'rgba(43,48,58,0.55)' }}>
                You've already submitted feedback. Thank you!
              </p>
            </div>
          )}

          {state === 'valid' && (
            <>
              <div className="mb-6">
                <h1
                  className="text-xl font-bold mb-1"
                  style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat, sans-serif)' }}
                >
                  How was your experience?
                </h1>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#E67E22' }}>
                  {courseName}
                </p>
              </div>
              <CourseFeedbackFormClient
                token={token!}
                firstName={firstName}
                courseName={courseName}
              />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
