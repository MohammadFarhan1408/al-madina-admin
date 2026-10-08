// Date-range model for the dashboard. Presets are rolling windows ending now;
// "custom" is a calendar range picked by the user. The API caps a range at 366
// days and buckets by day or month — months once a range gets too long to read
// day by day.
import type { Granularity } from './types'

export const RANGE_PRESETS = [
  { value: '7d', label: '7D', days: 7, caption: 'last 7 days' },
  { value: '30d', label: '30D', days: 30, caption: 'last 30 days' },
  { value: '90d', label: '90D', days: 90, caption: 'last 90 days' },
  { value: '12m', label: '12M', days: 365, caption: 'last 12 months' }
] as const

export type RangePreset = (typeof RANGE_PRESETS)[number]['value'] | 'custom'

export type DashboardRange = { preset: RangePreset; from: string; to: string } // from/to: YYYY-MM-DD, custom only

export type ResolvedRange = { from: string; to: string; granularity: Granularity }

const DAY_MS = 24 * 60 * 60 * 1000
const MAX_DAYS = 366

/** Null when a custom range is incomplete, inverted or longer than the API allows. */
export function resolveRange(r: DashboardRange, now = new Date()): ResolvedRange | null {
  if (r.preset !== 'custom') {
    const days = RANGE_PRESETS.find(p => p.value === r.preset)!.days

    return {
      from: new Date(now.getTime() - days * DAY_MS).toISOString(),
      to: now.toISOString(),
      granularity: days > 92 ? 'month' : 'day'
    }
  }

  if (!r.from || !r.to) return null

  const from = new Date(`${r.from}T00:00:00`)
  const to = new Date(`${r.to}T23:59:59.999`)
  const span = to.getTime() - from.getTime()

  if (Number.isNaN(span) || span <= 0 || span > MAX_DAYS * DAY_MS) return null

  return { from: from.toISOString(), to: to.toISOString(), granularity: span > 92 * DAY_MS ? 'month' : 'day' }
}

export function rangeCaption(r: DashboardRange) {
  return r.preset === 'custom' ? 'selected range' : RANGE_PRESETS.find(p => p.value === r.preset)!.caption
}
