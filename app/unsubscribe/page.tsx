import type { Metadata } from 'next'
import UnsubscribeForm from './UnsubscribeForm'

export const metadata: Metadata = {
  title: 'Unsubscribe | Western Dental Academy',
  robots: { index: false, follow: false },
}

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4F7F9' }}>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(13,59,110,0.08)' }}>
          <UnsubscribeForm token={token?.trim() ?? ''} />
        </div>
      </div>
    </main>
  )
}
