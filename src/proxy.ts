// Route protection: gate the (dashboard) group behind an access-token cookie and
// bounce authenticated users away from /login. Fine-grained role enforcement is
// handled by the backend (admin routes) and the client AuthContext.

import { NextResponse, type NextRequest } from 'next/server'

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/libs/auth/tokens'

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // A refresh token is enough to consider the session recoverable; the client
  // silently mints a fresh access token when needed.
  const hasSession =
    !!request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || !!request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  if (!hasSession && !isPublic) {
    const loginUrl = new URL('/login', request.url)

    loginUrl.searchParams.set('redirectTo', pathname)

    return NextResponse.redirect(loginUrl)
  }

  if (hasSession && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Send the bare root to the dashboard landing page.
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything except Next internals, API routes, and static assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)']
}
