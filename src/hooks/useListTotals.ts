'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

/**
 * Totals behind a list's tabs, e.g. orders per status. `fetchTotal` calls the
 * list endpoint itself with `limit: 1` and the tab's value, so a tab's count
 * is the backend's own `total` for the same filters the table is using — it
 * can't drift from the rows that tab shows. All variants run as one query, so
 * the tab counts update together.
 *
 * Counts are hidden (undefined) while a new set is loading, rather than
 * showing the previous filter's numbers against the new filter's rows.
 */
export function useListTotals<K extends string>(
  queryKey: readonly unknown[],
  keys: readonly K[],
  fetchTotal: (key: K) => Promise<{ total: number }>,
  enabled = true
): Partial<Record<K, number>> {
  const { data, isPlaceholderData } = useQuery({
    queryKey: [...queryKey, keys],
    queryFn: async () => {
      const results = await Promise.all(keys.map(key => fetchTotal(key)))

      return Object.fromEntries(keys.map((key, i) => [key, results[i].total])) as Record<K, number>
    },
    placeholderData: keepPreviousData,
    enabled
  })

  return isPlaceholderData || !data ? {} : data
}
