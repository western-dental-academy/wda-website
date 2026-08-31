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
    `*[_type == "staffMember" && clerkUserId == $uid && active == true][0]{
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

  const logoRes = await fetch('https://westerndentalacademy.com/WesternDentalAcademyLogo-Inverted.png')
  const logoBuffer = await logoRes.arrayBuffer()
  const logoBase64 = `data:image/png;base64,${Buffer.from(logoBuffer).toString('base64')}`

  const buffer = await renderToBuffer(
    React.createElement(StaffIdCardDocument, {
      name: staff.fullName ?? '',
      role: staff.jobTitle ?? '',
      department: staff.department ?? '',
      staffId: staff.staffId,
      logoUrl: logoBase64,
    }) as React.ReactElement<import('@react-pdf/renderer').DocumentProps>
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="WDA-Staff-ID-${staff.staffId}.pdf"`,
    },
  })
}
