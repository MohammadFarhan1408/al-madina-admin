import { type Dispatch, type SetStateAction, useCallback } from 'react'

import type { PaginationState } from '@tanstack/react-table'

/**
 * Wraps a filter setter so changing the filter also resets the table back to
 * page 0 — the "change a filter → jump to page 1" rule repeated across every
 * filtered DataTable page.
 */
export function useFilterReset(setPagination: Dispatch<SetStateAction<PaginationState>>) {
  return useCallback(
    <T,>(setter: (value: T) => void) =>
      (value: T) => {
        setter(value)
        setPagination(p => ({ ...p, pageIndex: 0 }))
      },
    [setPagination]
  )
}
