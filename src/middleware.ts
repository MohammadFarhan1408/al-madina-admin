// Route protection: gate the (dashboard) group behind an access-token cookie and
// bounce authenticated users away from /login. Fine-grained role enforcement is
// handled by the backend (admin routes) and the client AuthContext.
// Also sets the per-request Content-Security-Policy.

import { NextResponse, type NextRequest } from 'next/server'

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/libs/auth/tokens'

export const runtime = 'experimental-edge'

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password']

const API_ORIGIN = new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5001/v1/').origin

/**
 * Content-Security-Policy with a fresh nonce per request (Next.js applies it to
 * its own scripts during rendering, which is why every page renders dynamically
 * — see app/layout.tsx). Scripts must carry the nonce, so an injected <script>
 * can't run. Styles allow 'unsafe-inline': React and the charts/popovers set
 * inline style attributes, which a nonce cannot cover, and style injection is
 * far less dangerous than script injection.
 */
function contentSecurityPolicy(nonce: string) {
  const isDev = process.env.NODE_ENV === 'development'

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",

    // Product/collection images are user-supplied URLs (https Cloudinary in
    // production; local seed data may be plain http, so dev allows it).
    `img-src 'self' data: blob: https: ${API_ORIGIN}${isDev ? ' http:' : ''}`,
    "font-src 'self' data:",
    `connect-src 'self' ${API_ORIGIN}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests'])
  ].join('; ')
}

export function middleware(request: NextRequest) {
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

  const nonce = btoa(crypto.randomUUID())
  const csp = contentSecurityPolicy(nonce)
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  // Run on everything except Next internals, API routes, and static assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)']
}
