import { createClient } from '@sanity/client'
import Image from 'next/image'
import WorkshopFeedbackFormClient from '@/components/WorkshopFeedbackFormClient'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export const metadata = {
  title: 'Workshop Feedback',
  robots: { index: false },
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WorkshopFeedbackPage({ params }: PageProps) {
  const { id } = await params

  const workshopDate = await client.fetch<{
    workshop: string
    feedbackEnabled?: boolean
  } | null>(
    `*[_type == "workshopDate" && _id == "${id}"][0]{ workshop, feedbackEnabled }`
  )

  const feedbackEnabled = !workshopDate || workshopDate.feedbackEnabled !== false

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4F7F9' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#0D3B6E' }} className="px-6 py-6">
        <div className="max-w-lg mx-auto">
          <Image
            src="/WesternDentalAcademyLogo-Alternate-Inverted.svg"
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
          {!feedbackEnabled ? (
            <div className="text-center py-6">
              <p className="text-base font-semibold mb-2" style={{ color: '#0D3B6E' }}>
                Feedback unavailable
              </p>
              <p className="text-sm" style={{ color: 'rgba(43,48,58,0.55)' }}>
                Feedback is not available for this workshop.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1
                  className="text-xl font-bold mb-1"
                  style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat, sans-serif)' }}
                >
                  How was your experience?
                </h1>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#E67E22' }}>
                  Western Dental Academy
                </p>
              </div>
              <WorkshopFeedbackFormClient
                workshopDateId={id}
                workshopName={workshopDate?.workshop ?? ''}
              />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
