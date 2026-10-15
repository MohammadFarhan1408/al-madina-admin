// CSV export helpers. Excel needs a BOM to read UTF-8 (Arabic names), and any
// cell that starts with = + - @ is treated as a formula there — prefix it so an
// attacker-controlled name like `=HYPERLINK(...)` is data, not code.
import type { Paginated } from '@/libs/api/types'

export type CsvCell = string | number | boolean | null | undefined

const escapeCell = (value: CsvCell) => {
  let s = value == null ? '' : String(value)

  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`

  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const toCsv = (rows: CsvCell[][]) => rows.map(row => row.map(escapeCell).join(',')).join('\r\n')

export function downloadCsv(filename: string, rows: CsvCell[][]) {
  const blob = new Blob(['﻿', toCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Walk every page of a list endpoint (the API caps a page at 50 rows). */
export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<Paginated<T>>,
  maxRows = 5000
): Promise<{ items: T[]; truncated: boolean }> {
  const items: T[] = []
  const limit = 50

  for (let page = 1; items.length < maxRows; page++) {
    const result = await fetchPage(page, limit)

    items.push(...result.items)

    if (!result.hasMore) return { items, truncated: false }
  }

  return { items: items.slice(0, maxRows), truncated: true }
}
