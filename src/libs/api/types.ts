// Shared API contract types — mirrors the backend response envelopes (doc §7).

/** Standard success envelope: `{ data, message? }`. */
export type ApiEnvelope<T> = {
  data: T
  message?: string
}

/** Paginated payload shape returned by list endpoints. */
export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

/** Standard error envelope: `{ status, message, code, details? }`. */
export type ApiErrorBody = {
  status: number
  message: string
  code?: string
  details?: Record<string, unknown>
}

/** Normalized error surfaced to the UI after Axios interceptors run. */
export class ApiError extends Error {
  status: number
  code?: string
  details?: Record<string, unknown>

  constructor(body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.status = body.status
    this.code = body.code
    this.details = body.details
  }
}
