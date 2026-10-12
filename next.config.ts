import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

// Static security headers for every response. The Content-Security-Policy is
// per-request (it carries a nonce) and is set in src/middleware.ts.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }] : [])
]

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  }
}

export default nextConfig
