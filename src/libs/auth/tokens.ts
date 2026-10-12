// Client-side cookie helpers for auth tokens.
// Tokens are stored in (non-httpOnly) cookies so the Axios client can read the
// access token and the Next.js middleware can gate routes server-side.

export const ACCESS_TOKEN_COOKIE = 'am_access_token'
export const REFRESH_TOKEN_COOKIE = 'am_refresh_token'

// The access cookie lives exactly as long as the 15-minute JWT inside it, so an
// expired token is never sent. The refresh cookie lives until the server says the
// session ends (`refreshExpiresAt` — 24h after sign-in for admin accounts).
const ACCESS_MAX_AGE = 15 * 60
const FALLBACK_REFRESH_MAX_AGE = 60 * 60 * 24

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

export function setTokens(accessToken: string, refreshToken?: string, refreshExpiresAt?: string) {
  writeCookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_MAX_AGE)

  if (refreshToken) {
    const seconds = refreshExpiresAt
      ? Math.max(0, Math.floor((new Date(refreshExpiresAt).getTime() - Date.now()) / 1000))
      : FALLBACK_REFRESH_MAX_AGE

    writeCookie(REFRESH_TOKEN_COOKIE, refreshToken, seconds)
  }
}

export function clearTokens() {
  deleteCookie(ACCESS_TOKEN_COOKIE)
  deleteCookie(REFRESH_TOKEN_COOKIE)
}
