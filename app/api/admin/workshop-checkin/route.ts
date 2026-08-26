import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { registrationId, checkedIn } = body as { registrationId?: string; checkedIn?: boolean }
  if (!registrationId?.trim()) {
    return Response.json({ error: 'registrationId is required' }, { status: 400 })
  }
  if (typeof checkedIn !== 'boolean') {
    return Response.json({ error: 'checkedIn must be a boolean' }, { status: 400 })
  }

  try {
    await client
      .patch(registrationId)
      .set({ checkedIn, checkedInAt: checkedIn ? new Date().toISOString() : null })
      .commit()

    // Fire-and-forget certificate generation when checking someone in
    if (checkedIn) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://westerndentalacademy.com'
      fetch(`${siteUrl}/api/workshops/certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
        body: JSON.stringify({ registrationId }),
      }).catch((err) => console.error('Certificate send error:', err))
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Workshop check-in error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
