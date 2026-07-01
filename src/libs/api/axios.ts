// Central Axios instance. All feature api services go through this.
// - Request interceptor attaches the Bearer access token.
// - Response interceptor unwraps errors into ApiError and performs a single
//   silent token refresh + retry on 401 (rotating refresh tokens, doc §6).

import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'

import { ApiError, type ApiErrorBody } from './types'
import { endpoints } from './endpoints'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../auth/tokens'

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5001/v1/'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
})

// Bare client for the refresh call so it never loops through the interceptor.
const refreshClient = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } })

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

    setTokens(payload.accessToken, payload.refreshToken)

    return payload.accessToken as string
  } catch {
    clearTokens()

    return null
  }
}

api.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status

    // Attempt one silent refresh + retry on 401 (skip auth endpoints themselves).
    const isAuthCall = original?.url?.includes('/auth/')

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true

      refreshPromise = refreshPromise ?? refreshAccessToken()
      const newToken = await refreshPromise

      refreshPromise = null

      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` }

        return api(original)
      }

      // Refresh failed — force re-login on the client.
      if (typeof window !== 'undefined') window.location.href = '/login'
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
