import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/portal(.*)',
  '/admin(.*)',
  '/auth/redirect(.*)',
  '/api/students/provision(.*)',
])

const clerkHandler = clerkMiddleware(async (auth, request: NextRequest) => {
  if (isProtectedRoute(request)) {
    await auth.protect()
  }
})

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always pass through API and static routes
  if (
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/moodle') ||
    pathname.startsWith('/__clerk') ||
    pathname.startsWith('/_next') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next()
  }

  const hostname = request.headers.get('host') ?? ''
  if (hostname === 'wda-website.vercel.app') return NextResponse.next()
  if (hostname.match(/wda-website-[a-z0-9]+-aiden-wda\.vercel\.app/)) return NextResponse.next()

  const decodedPathname = decodeURIComponent(pathname)
  if (
    pathname.startsWith('/assets/') ||
    pathname === '/favicon.ico' ||
    decodedPathname.startsWith('/Western Dental Academy Logo')
  ) {
    return NextResponse.next()
  }

  if (pathname === '/auth/redirect') return NextResponse.next()
  if (pathname === '/coming-soon') return NextResponse.next()

  // ── Maintenance mode check FIRST ──
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Staff time-tracking routes bypass maintenance mode.
    // Also bypass /sign-in and /sign-up (needed for the auth redirect chain when staff
    // are logged out: /staff → layout redirects to /sign-in → must not hit coming-soon)
    // and /api/time (so the ClockWidget API calls work from the staff page).
    if (
      pathname.startsWith('/staff') ||
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/sign-up') ||
      pathname.startsWith('/api/time')
    ) {
      const clerkResponse = await clerkHandler(request, {} as any)
      if (clerkResponse) return clerkResponse
      return NextResponse.next()
    }

    const previewCookie = request.cookies.get('wda-preview')
    if (previewCookie?.value === 'true') {
      // Still run Clerk for authenticated routes even in maintenance mode
      const clerkResponse = await clerkHandler(request, {} as any)
      if (clerkResponse) return clerkResponse
      return NextResponse.next()
    }

    const previewParam = request.nextUrl.searchParams.get('preview')
    if (previewParam && previewParam === process.env.PREVIEW_KEY) {
      const destination = request.nextUrl.clone()
      destination.searchParams.delete('preview')
      const response = NextResponse.redirect(destination)
      response.cookies.set('wda-preview', 'true', {
        maxAge: 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })
      return response
    }

    const url = request.nextUrl.clone()
    url.pathname = '/coming-soon'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // ── Clerk auth check (only when not in maintenance mode) ──
  const clerkResponse = await clerkHandler(request, {} as any)
  if (clerkResponse) return clerkResponse

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets/).*)',
    '/__clerk/:path*',
  ],
}