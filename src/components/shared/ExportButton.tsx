'use client'

import { useState } from 'react'

import Button from '@/components/ui/Button'
import { useToast } from '@/contexts/ToastContext'
import { downloadCsv, fetchAllPages, type CsvCell } from '@/libs/csv'
import { getErrorMessage } from '@/libs/api/types'
import type { Paginated } from '@/libs/api/types'

export type ExportColumn<T> = { header: string; value: (item: T) => CsvCell }

type ExportButtonProps<T> = {
  filename: string
  columns: ExportColumn<T>[]

  /** Fetch one page with the list's *current* filters, so the file matches the table. */
  fetchPage: (page: number, limit: number) => Promise<Paginated<T>>
}

/** Downloads the filtered list as CSV — every page of it, not just the visible one. */
const ExportButton = <T,>({ filename, columns, fetchPage }: ExportButtonProps<T>) => {
  const { success, error, toast } = useToast()
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)

    try {
      const { items, truncated } = await fetchAllPages(fetchPage)

      downloadCsv(`${filename}-${new Date().toISOString().slice(0, 10)}.csv`, [
        columns.map(c => c.header),
        ...items.map(item => columns.map(c => c.value(item)))
      ])

      if (truncated)
        toast(`Exported the first ${items.length.toLocaleString()} rows — narrow the filters for the rest`, 'warning')
      else success(`Exported ${items.length.toLocaleString()} row${items.length === 1 ? '' : 's'}`)
    } catch (err) {
      error(getErrorMessage(err, 'Export failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      variant='outlined'
      color='secondary'
      loading={busy}
      startIcon={<i className='tabler-download' />}
      onClick={run}
    >
      Export CSV
    </Button>
  )
}

export default ExportButton
