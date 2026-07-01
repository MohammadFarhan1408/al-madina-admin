// Small presentation helpers shared across feature tables and detail views.

/** Format a money amount with its currency (backend defaults to AED). */
export function formatCurrency(amount: number | undefined | null, currency = 'AED') {
  if (amount == null) return '—'

  return new Intl.NumberFormat('en-AE', { style: 'currency', currency }).format(amount)
}

/** Format an ISO date string as a readable date. */
export function formatDate(value?: string | Date | null) {
  if (!value) return '—'

  const date = typeof value === 'string' ? new Date(value) : value

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

/** Format an ISO date string with time. */
export function formatDateTime(value?: string | Date | null) {
  if (!value) return '—'

  const date = typeof value === 'string' ? new Date(value) : value

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/** Title-case a snake/kebab/single-word string for display. */
export function humanize(value?: string) {
  if (!value) return ''

  return value.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
