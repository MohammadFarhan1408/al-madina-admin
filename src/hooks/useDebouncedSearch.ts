'use client'

import { useState, type Dispatch, type SetStateAction } from 'react'

import type { PaginationState } from '@tanstack/react-table'

import { useDebouncedValue } from './useDebouncedValue'

/**
 * Search text for a server-paginated list. `search` drives the input;
 * `debouncedSearch` is what goes to the API. The table returns to page 1 when
 * the *debounced* term changes, in the same render as the new term reaches the
 * query — so one keystroke burst makes exactly one request.
 *
 * (Resetting the page on every keystroke instead, via useFilterReset, fired a
 * request for the old term on page 1 and then another for the new term once
 * the debounce settled: a duplicate fetch and a flash of stale rows.)
 */
export function useDebouncedSearch(
  setPagination: Dispatch<SetStateAction<PaginationState>>,
  initial = ''
): { search: string; setSearch: (value: string) => void; debouncedSearch: string } {
  const [search, setSearch] = useState(initial)
  const debouncedSearch = useDebouncedValue(search)
  const [pagedFor, setPagedFor] = useState(debouncedSearch)

  if (pagedFor !== debouncedSearch) {
    setPagedFor(debouncedSearch)
    setPagination(p => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }))
  }

  return { search, setSearch, debouncedSearch: debouncedSearch.trim() }
}
