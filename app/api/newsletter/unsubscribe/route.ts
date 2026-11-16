import { NextRequest } from 'next/server'
import { setSubscribed } from '@/lib/newsletter/send'

// POST ?token=…            one-click unsubscribe from the mail app (RFC 8058)
// POST { token, resubscribe } from the /unsubscribe page
// GET is not used to unsubscribe, because email link scanners open every link.
export async function POST(req: NextRequest) {
  let token = req.nextUrl.searchParams.get('token') ?? ''
  let resubscribe = false
  if ((req.headers.get('content-type') ?? '').includes('application/json')) {
    try {
      const body = await req.json() as { token?: string; resubscribe?: boolean }
      token = body.token ?? token
      resubscribe = body.resubscribe === true
    } catch { /* one-click posts are form-encoded; ignore */ }
  }
  if (!token) return Response.json({ error: 'Missing token' }, { status: 400 })
  try {
    const result = await setSubscribed(token, resubscribe)
    if (!result) return Response.json({ error: 'This link is invalid or has expired.' }, { status: 404 })
    return Response.json({ success: true, subscribed: resubscribe })
  } catch (err) {
    console.error('Unsubscribe error:', err)
    return Response.json({ error: 'Something went wrong. Please email info@westerndentalacademy.com.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone()
  url.pathname = '/unsubscribe'
  return Response.redirect(url, 303)
}
