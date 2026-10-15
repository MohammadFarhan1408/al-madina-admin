'use client'

import { useQuery } from '@tanstack/react-query'

import { searchApi } from '../api/searchApi'

/** Disabled below two characters — the API rejects shorter queries. */
export const useAdminSearch = (q: string) =>
  useQuery({
    queryKey: ['search', q] as const,
    queryFn: () => searchApi.search(q),
    enabled: q.length >= 2,
    staleTime: 15_000
  })
