// TanStack Query client factory with sensible admin-panel defaults.

import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '../api/types'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Never retry client errors (4xx); retry transient failures once.
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false

          return failureCount < 1
        }
      },
      mutations: {
        retry: false
      }
    }
  })
}
