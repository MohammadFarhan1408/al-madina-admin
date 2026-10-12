// Central Axios instance. All feature api services go through this.
// - Request interceptor attaches the Bearer access token.
// - Response interceptor unwraps errors into ApiError and performs a single
//   silent token refresh + retry on 401 (rotating refresh tokens, doc §6).

import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'

import { ApiError, type ApiErrorBody } from './types'
import { endpoints } from './endpoints'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../auth/tokens'

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5001/v1/'

// A hung request should fail with a retryable error, not spin forever.
export const api = axios.create({
  baseURL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' }
})

// Bare client for the refresh call so it never loops through the interceptor.
const refreshClient = axios.create({ baseURL, timeout: 20_000, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()

  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

// De-duplicate concurrent refreshes into one in-flight promise.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()

  if (!refreshToken) return null

  try {
    const { data } = await refreshClient.post(endpoints.auth.refresh, { refreshToken })
    const payload = data?.data ?? data

    setTokens(payload.accessToken, payload.refreshToken, payload.refreshExpiresAt)

    return payload.accessToken as string
  } catch {
    // Another tab may have rotated the same refresh token a moment earlier: the
    // server rejected ours, but the cookies already hold the new pair. Use it
    // instead of logging this tab (and, via the shared cookies, every tab) out.
    if (getRefreshToken() !== refreshToken && getAccessToken()) return getAccessToken() ?? null

    clearTokens()

    return null
  }
}

// Calls that must not trigger a refresh: the credential endpoints themselves.
// (`/auth/me` is deliberately not here — it needs a refresh like any other call.)
const NO_REFRESH = [endpoints.auth.refresh, endpoints.auth.signIn, endpoints.auth.signOut, endpoints.auth.forgotPassword, endpoints.auth.resetPassword]

api.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status

    // Attempt one silent refresh + retry on 401 (skip the credential endpoints).
    const isAuthCall = NO_REFRESH.some(path => original?.url?.endsWith(path))

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true

      // Another tab may already have refreshed: retry with its token first.
      const current = getAccessToken()
      const sent = String(original.headers?.Authorization ?? '')

      if (current && sent !== `Bearer ${current}`) {
        original.headers = { ...original.headers, Authorization: `Bearer ${current}` }

        return api(original)
      }

      refreshPromise = refreshPromise ?? refreshAccessToken()
      const newToken = await refreshPromise

      refreshPromise = null

      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` }

        return api(original)
      }

      // Refresh failed — force re-login on the client.
      //
      // Clear the tokens *here* rather than trusting the refresh path to have
      // done it: `refreshAccessToken` returns null without clearing anything
      // when there's no refresh token at all. The middleware counts a stale
      // access cookie as a live session, so redirecting while one is still set
      // bounces /login straight back to /dashboard, which re-fires this same
      // 401 — a full-page reload loop that reads like the app is hammering the
      // server. Also don't re-navigate if we're already on /login.
      if (typeof window !== 'undefined') {
        clearTokens()

        if (!window.location.pathname.startsWith('/login')) window.location.href = '/login'
      }
    }

    const body: ApiErrorBody = error.response?.data ?? {
      status: status ?? 0,
      message: error.message || 'Network error'
    }

    return Promise.reject(new ApiError(body))
  }
)

/** Unwraps the `{ data }` envelope and returns the payload. */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get(url, config)

  return (res.data?.data ?? res.data) as T
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.post(url, body, config)

  return (res.data?.data ?? res.data) as T
}

export async function apiPatch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.patch(url, body, config)

  return (res.data?.data ?? res.data) as T
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.delete(url, config)

  return (res.data?.data ?? res.data) as T
}
