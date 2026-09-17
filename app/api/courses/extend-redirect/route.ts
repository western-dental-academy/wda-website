import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const enrollmentId = req.nextUrl.searchParams.get('enrollmentId')
  if (!enrollmentId) {
    return NextResponse.json({ error: 'enrollmentId is required' }, { status: 400 })
  }

  const origin = req.nextUrl.origin

  const res = await fetch(`${origin}/api/courses/extend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enrollmentId }),
  })

  const data = await res.json() as { url?: string; error?: string }

  if (!res.ok || !data.url) {
    return NextResponse.json({ error: data.error ?? 'Failed to create checkout session' }, { status: 500 })
  }

  return NextResponse.redirect(data.url)
}
