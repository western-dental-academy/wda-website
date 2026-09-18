import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@sanity/client'

export const dynamic = 'force-dynamic'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token:     process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function ConfirmContent({ token }: { token: string }) {
  const subscriber = await client.fetch<{ _id: string; confirmed?: boolean; firstName?: string } | null>(
    `*[_type == "subscriber" && inviteToken == "${token}" && !(_id in path("drafts.**"))][0]{
      _id, confirmed, firstName
    }`
  )

  if (!subscriber) {
    return (
      <Card>
        <IconX />
        <h1 className="text-xl font-bold mb-2" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Invalid Link
        </h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(43,48,58,0.65)' }}>
          This link is invalid or has already been used. If you believe this is an error, please{' '}
          <a href="mailto:info@westerndentalacademy.com" style={{ color: '#378ADD' }}>contact us</a>.
        </p>
        <Link href="/" className="text-sm" style={{ color: '#378ADD' }}>← Back to Home</Link>
      </Card>
    )
  }

  if (subscriber.confirmed) {
    return (
      <Card>
        <IconCheck />
        <h1 className="text-xl font-bold mb-2" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>
          You&apos;re Already Subscribed!
        </h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(43,48,58,0.65)' }}>
          {subscriber.firstName ? `${subscriber.firstName}, you're` : "You're"} already on our mailing list. We&apos;ll keep you in the loop about upcoming events and professional development opportunities.
        </p>
        <Link href="/professional-development" className="text-sm" style={{ color: '#378ADD' }}>View Upcoming Events →</Link>
      </Card>
    )
  }

  // Confirm subscription
  await client.patch(subscriber._id).set({
    confirmed:    true,
    subscribedAt: new Date().toISOString(),
    inviteToken:  null,
  }).commit()

  return (
    <Card>
      <IconCheck />
      <h1 className="text-xl font-bold mb-2" style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}>
        You&apos;re Subscribed!
      </h1>
      <p className="text-sm mb-6" style={{ color: 'rgba(43,48,58,0.65)' }}>
        {subscriber.firstName ? `Welcome, ${subscriber.firstName}!` : 'Welcome!'} You&apos;re now part of the WDA community. We&apos;ll keep you updated on upcoming events, courses, and professional development opportunities.
      </p>
      <Link
        href="/professional-development"
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
        style={{ backgroundColor: '#0D3B6E' }}
      >
        View Upcoming Events →
      </Link>
    </Card>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4F7F9' }}>
      <div className="px-6 py-5" style={{ backgroundColor: '#0D3B6E' }}>
        <p className="text-sm font-bold" style={{ color: '#ffffff', fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Western Dental Academy
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(13,59,110,0.08)' }}>
          {children}
        </div>
      </div>
    </main>
  )
}

function IconCheck() {
  return (
    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(22,163,74,0.1)' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} className="w-8 h-8" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  )
}

function IconX() {
  return (
    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(220,38,38,0.1)' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2.5} className="w-8 h-8" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  )
}

async function ConfirmInner({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  if (!token?.trim()) notFound()
  return <ConfirmContent token={token.trim()} />
}

export default function SubscribeConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F7F9' }}>
        <p className="text-sm" style={{ color: 'rgba(43,48,58,0.5)' }}>Loading…</p>
      </main>
    }>
      <ConfirmInner searchParams={searchParams} />
    </Suspense>
  )
}
