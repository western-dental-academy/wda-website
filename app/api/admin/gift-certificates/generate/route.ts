import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'
import { generateGiftCode, getExpiryDate } from '@/lib/giftCertificates'
import { generateGiftCertPdf } from '@/lib/giftCertificatePdf'
import fs from 'fs'
import path from 'path'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'lance@westerndentalacademy.com',
  'ryan@westerndentalacademy.com',
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

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  const generatorName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { amount, recipientName } = body as { amount?: number; recipientName?: string }
  if (!amount || amount < 1) {
    return Response.json({ error: 'Amount is required' }, { status: 400 })
  }

  const code = generateGiftCode()
  const now = new Date().toISOString()
  const expiresAt = getExpiryDate()

  await client.create({
    _type: 'giftCertificate',
    code,
    amount,
    remainingBalance: amount,
    recipientName: recipientName?.trim() || 'Door Prize Winner',
    purchasedAt: now,
    expiresAt,
    status: 'admin',
    isAdminGenerated: true,
    generatedBy: email,
    generatedByName: generatorName || email,
  })

  const logoPath = path.join(process.cwd(), 'public', 'Inverted.png')
  const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`

  const pdfBuffer = await generateGiftCertPdf({
    recipientName: recipientName?.trim() || 'Door Prize Winner',
    amount,
    code,
    expiresAt,
    logoBase64,
  })

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="WDA-Gift-Certificate-${code}.pdf"`,
    },
  })
}
