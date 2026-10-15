// Calendar-day ranges for list filters. Values are local `YYYY-MM-DD` keys
// (what Calendar and DateInput use); `dateRangeParams` turns them into the
// instants the API compares against, so a range always covers whole days in
// the admin's own timezone.

export type DateRange = { from?: string; to?: string }

/** Local-date key, `YYYY-MM-DD`. */
export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const parseDateKey = (key?: string) => {
  if (!key) return null
  const [y, m, d] = key.split('-').map(Number)

  return y && m && d ? new Date(y, m - 1, d) : null
}

/**
 * `{ from, to }` as ISO instants: the start of `from` and the *end* of `to`.
 * Sending the bare `to` date instead (`2026-10-12`) parses as midnight UTC on
 * the server, so a "to 12 Oct" filter silently dropped everything placed on
 * the 12th — and, in UTC+, part of the 11th as well.
 */
export function dateRangeParams(range: DateRange): { from?: string; to?: string } {
  return {
    from: range.from ? new Date(`${range.from}T00:00:00`).toISOString() : undefined,
    to: range.to ? new Date(`${range.to}T23:59:59.999`).toISOString() : undefined
  }
}

export const hasDateRange = (range: DateRange) => Boolean(range.from || range.to)

export type DatePreset = { id: string; label: string; range: () => Required<DateRange> }

/** Calendar days a range covers, both ends included (0 when incomplete). */
export function daysInRange(range: DateRange) {
  const from = parseDateKey(range.from)
  const to = parseDateKey(range.to)

  if (!from || !to) return 0

  // Round, so a daylight-saving shift inside the range doesn't lose a day.
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1
}

/** The browser's IANA time zone, so the API can cut days where the admin does. */
export const localTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined
  } catch {
    return undefined
  }
}

export const daysAgo = (n: number) => {
  const d = new Date()

  d.setDate(d.getDate() - n)

  return d
}

export const DATE_PRESETS: DatePreset[] = [
  { id: 'today', label: 'Today', range: () => ({ from: toDateKey(new Date()), to: toDateKey(new Date()) }) },
  { id: '7d', label: 'Last 7 days', range: () => ({ from: toDateKey(daysAgo(6)), to: toDateKey(new Date()) }) },
  { id: '30d', label: 'Last 30 days', range: () => ({ from: toDateKey(daysAgo(29)), to: toDateKey(new Date()) }) },
  {
    id: 'month',
    label: 'This month',
    range: () => {
      const now = new Date()

      return { from: toDateKey(new Date(now.getFullYear(), now.getMonth(), 1)), to: toDateKey(now) }
    }
  },
  {
    id: 'last-month',
    label: 'Last month',
    range: () => {
      const now = new Date()

      return {
        from: toDateKey(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        to: toDateKey(new Date(now.getFullYear(), now.getMonth(), 0))
      }
    }
  }
]

/** The preset a range exactly matches, if any — so the trigger can say "Last 7 days". */
export const matchPreset = (range: DateRange, presets: DatePreset[] = DATE_PRESETS) =>
  presets.find(p => {
    const r = p.range()

    return r.from === range.from && r.to === range.to
  })

const shortDate = (key: string, withYear: boolean) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) }).format(
    parseDateKey(key) ?? new Date()
  )

/** "Last 7 days" · "3 Oct – 12 Oct 2026" · "From 3 Oct 2026" · "Until 12 Oct 2026". */
export function formatDateRange(range: DateRange, presets: DatePreset[] = DATE_PRESETS) {
  const preset = matchPreset(range, presets)

  if (preset) return preset.label

  if (range.from && range.to) {
    if (range.from === range.to) return shortDate(range.from, true)

    const sameYear = range.from.slice(0, 4) === range.to.slice(0, 4)

    return `${shortDate(range.from, !sameYear)} – ${shortDate(range.to, true)}`
  }

  if (range.from) return `From ${shortDate(range.from, true)}`
  if (range.to) return `Until ${shortDate(range.to, true)}`

  return ''
}
