import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

export default async function AuthRedirectPage() {
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''

  if (ADMIN_EMAILS.includes(email)) {
    redirect('/admin')
  }

  redirect('/portal')
}
