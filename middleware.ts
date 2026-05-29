import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";

  // Pass through Vercel preview deployments (*.vercel.app)
  if (hostname.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  // Pass through Next.js internals and static assets
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/wda-logo") ||
    pathname.startsWith("/og-image")
  ) {
    return NextResponse.next();
  }

  // Already on the coming-soon page — don't redirect again
  if (pathname === "/coming-soon") {
    return NextResponse.next();
  }

  // Maintenance mode is off — normal site operation
  if (process.env.MAINTENANCE_MODE !== "true") {
    return NextResponse.next();
  }

  // Preview bypass via cookie (set on a prior visit with the correct key)
  const previewCookie = request.cookies.get("wda-preview");
  if (previewCookie?.value === "true") {
    return NextResponse.next();
  }

  // Preview bypass via query param — grants a 24-hour cookie
  const previewParam = request.nextUrl.searchParams.get("preview");
  if (previewParam && previewParam === process.env.PREVIEW_KEY) {
    const destination = request.nextUrl.clone();
    destination.searchParams.delete("preview");
    const response = NextResponse.redirect(destination);
    response.cookies.set("wda-preview", "true", {
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return response;
  }

  // Redirect everything else to /coming-soon
  const url = request.nextUrl.clone();
  url.pathname = "/coming-soon";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
