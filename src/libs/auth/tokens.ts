// Client-side cookie helpers for auth tokens.
// Tokens are stored in (non-httpOnly) cookies so the Axios client can read the
// access token and the Next.js middleware can gate routes server-side.

export const ACCESS_TOKEN_COOKIE = 'am_access_token'
export const REFRESH_TOKEN_COOKIE = 'am_refresh_token'

// Access token is short-lived (15m); refresh token drives silent renewal (30d).
const ACCESS_MAX_AGE = 60 * 60 // 1h ceiling; renewed on refresh
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

const isBrowser = () => typeof document !== 'undefined'

function readCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined

  const match = document.cookie.split('; ').find(row => row.startsWith(`${name}=`))

  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : undefined
}

function writeCookie(name: string, value: string, maxAge: number) {
  if (!isBrowser()) return

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
}

function deleteCookie(name: string) {
  if (!isBrowser()) return

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

export const getAccessToken = () => readCookie(ACCESS_TOKEN_COOKIE)
export const getRefreshToken = () => readCookie(REFRESH_TOKEN_COOKIE)

export function setTokens(accessToken: string, refreshToken?: string) {
  writeCookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_MAX_AGE)

  if (refreshToken) writeCookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_MAX_AGE)
}

export function clearTokens() {
  deleteCookie(ACCESS_TOKEN_COOKIE)
  deleteCookie(REFRESH_TOKEN_COOKIE)
}
