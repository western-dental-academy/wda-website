export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always pass through API and static routes
  if (
    pathname.startsWith('/api') ||
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

  if (pathname === '/coming-soon') return NextResponse.next()

  // ── Maintenance mode check BEFORE Clerk ──
  if (process.env.MAINTENANCE_MODE === 'true') {
    const previewCookie = request.cookies.get('wda-preview')
    if (previewCookie?.value === 'true') return NextResponse.next()

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

  // ── Clerk auth check (only runs when not in maintenance mode) ──
  const clerkResponse = await clerkHandler(request, {} as any)
  if (clerkResponse) return clerkResponse

  return NextResponse.next()
}