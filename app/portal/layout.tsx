import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { linkClerkToStudent } from '@/lib/students/link-clerk'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (ADMIN_EMAILS.includes(email)) {
    redirect('/admin')
  }

  await linkClerkToStudent(userId, email)

  return <>{children}</>
}
