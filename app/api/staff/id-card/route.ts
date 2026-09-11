import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { renderToBuffer } from '@react-pdf/renderer'
import { StaffIdCardDocument } from '@/lib/staff/idCard'
import React from 'react'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  const staff = await sanity.fetch(
    `*[_type == "staffMember" && !(_id in path("drafts.**")) && clerkUserId == $uid && active == true][0]{
      fullName, jobTitle, department, staffId
    }`,
    { uid: userId }
  )

  if (!staff) return new NextResponse('Staff record not found', { status: 404 })

  if (!staff.staffId) {
    return NextResponse.json(
      { error: 'Staff ID not yet assigned. Please contact your administrator.' },
      { status: 400 }
    )
  }

  // Fetch logo
  const logoRes = await fetch('https://westerndentalacademy.com/Inverted.png')
  const logoBuffer = await logoRes.arrayBuffer()
  const logoBase64 = `data:image/png;base64,${Buffer.from(logoBuffer).toString('base64')}`

  // Look up matching teamMember for photo
  let photoBase64: string | null = null
  try {
    console.log('Looking for team member:', staff.fullName)
    const teamMember = await sanity.fetch<{ imageUrl: string } | null>(
      `*[_type == "teamMember" && !(_id in path("drafts.**")) && name == $name][0]{ "imageUrl": photo.asset->url }`,
      { name: staff.fullName ?? '' }
    )
    console.log('Found team member:', teamMember)
    if (teamMember?.imageUrl) {
      const photoRes = await fetch(`${teamMember.imageUrl}?w=200&h=267&fit=crop&auto=format`)
      if (photoRes.ok) {
        const photoBuffer = await photoRes.arrayBuffer()
        photoBase64 = `data:image/jpeg;base64,${Buffer.from(photoBuffer).toString('base64')}`
      }
    }
    console.log('Photo base64 length:', photoBase64?.length ?? 0)
  } catch (err) {
    console.log('Photo fetch error:', err)
    // Photo is optional — proceed without it
  }

  // Fetch QR code
  const qrRes = await fetch(
    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://westerndentalacademy.com&bgcolor=ffffff&color=0D3B6E'
  )
  const qrBuffer = await qrRes.arrayBuffer()
  const qrBase64 = `data:image/png;base64,${Buffer.from(qrBuffer).toString('base64')}`

  const buffer = await renderToBuffer(
    React.createElement(StaffIdCardDocument, {
      name: staff.fullName ?? '',
      role: staff.jobTitle ?? '',
      department: staff.department ?? '',
      staffId: staff.staffId,
      logoUrl: logoBase64,
      photoBase64,
      qrBase64,
    }) as React.ReactElement<import('@react-pdf/renderer').DocumentProps>
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="WDA-Staff-ID-${staff.staffId}.pdf"`,
    },
  })
}
