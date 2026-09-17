import { NextRequest } from 'next/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase()
  if (!code) return Response.json({ error: 'Code is required.' }, { status: 400 })

  const cert = await client.fetch<{
    status: string; amount: number; remainingBalance?: number; expiresAt: string
  } | null>(
    `*[_type == "giftCertificate" && !(_id in path("drafts.**")) && code == $code][0]{
      status, amount, remainingBalance, expiresAt
    }`,
    { code }
  )

  if (!cert) return Response.json({ error: 'Gift certificate not found.' }, { status: 404 })
  if (cert.status === 'redeemed') return Response.json({ error: 'This gift certificate has already been fully redeemed.' }, { status: 400 })
  if (cert.status === 'expired' || new Date(cert.expiresAt) < new Date()) return Response.json({ error: 'This gift certificate has expired.' }, { status: 400 })
  if (cert.status !== 'active' && cert.status !== 'admin') return Response.json({ error: 'This gift certificate is not valid.' }, { status: 400 })

  const remainingBalance = cert.remainingBalance ?? cert.amount
  if (remainingBalance <= 0) return Response.json({ error: 'This gift certificate has no remaining balance.' }, { status: 400 })

  return Response.json({ valid: true, amount: cert.amount, remainingBalance })
}
