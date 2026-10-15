// Date-range model for the dashboard. A range is always whole calendar days in
// the admin's own time zone (`YYYY-MM-DD` keys, both ends included), the same
// model the list pages' DateRangeFilter uses. `resolveRange` turns it into the
// instants the API compares against (start of `from`, end of `to`), the zone to
// bucket in, and a granularity that suits the span: days up to ~3 months,
// months beyond (a 365-point daily line is unreadable at card width).
import {
  DATE_PRESETS,
  dateRangeParams,
  daysAgo,
  daysInRange,
  localTimeZone,
  toDateKey,
  type DatePreset,
  type DateRange
} from '@/libs/dateRange'

import type { Granularity } from './types'

/** The API rejects ranges longer than this (admin.schema MAX_SUMMARY_DAYS). */
export const MAX_RANGE_DAYS = 366

const MONTHLY_FROM_DAYS = 93

const lastDays = (n: number) => () => ({ from: toDateKey(daysAgo(n - 1)), to: toDateKey(new Date()) })

const byId = (id: string) => DATE_PRESETS.find(p => p.id === id)!

/** The list pages' presets plus the longer windows a dashboard needs. */
export const DASHBOARD_PRESETS: DatePreset[] = [
  byId('today'),
  byId('7d'),
  byId('30d'),
  { id: '90d', label: 'Last 90 days', range: lastDays(90) },
  { id: '12m', label: 'Last 12 months', range: lastDays(365) },
  byId('month'),
  byId('last-month')
]

/** One-click windows shown beside the custom picker. */
export const QUICK_PRESETS = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: '12m', label: '12M' }
] as const

export const presetRange = (id: string): Required<DateRange> =>
  (DASHBOARD_PRESETS.find(p => p.id === id) ?? byId('30d')).range()

export const defaultRange = () => presetRange('30d')

export type ResolvedRange = { from: string; to: string; granularity: Granularity; tz?: string }

/** Why a picked range can't be queried, or null when it can. */
export function rangeError(range: DateRange): string | null {
  const days = daysInRange(range)

  if (days <= 0) return 'Pick a start and an end date'
  if (days > MAX_RANGE_DAYS) return `Pick a range of up to ${MAX_RANGE_DAYS} days`

  return null
}

export function resolveRange(range: Required<DateRange>): ResolvedRange {
  const { from, to } = dateRangeParams(range) as Required<DateRange>

  return {
    from,
    to,
    granularity: daysInRange(range) >= MONTHLY_FROM_DAYS ? 'month' : 'day',
    tz: localTimeZone()
  }
}

/** "previous 30 days" — the window the change figures compare against. */
export function previousCaption(range: DateRange) {
  const days = daysInRange(range)

  return days === 1 ? 'previous day' : `previous ${days} days`
}
