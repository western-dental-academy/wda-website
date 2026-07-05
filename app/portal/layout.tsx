import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Link Clerk account to Sanity student record on every portal visit
  // This is a no-op if already linked
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/students/link-clerk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Failed to link Clerk account:', error)
  }

  return <>{children}</>
}