'use client'

// Generic table built on TanStack Table, in two modes:
// - manual (default): pagination/sorting state is owned by the caller and
//   forwarded to the backend (page/limit≤50 per doc §7).
// - client (`manualPagination={false}`): the full dataset is already loaded
//   (e.g. Categories/Collections have no backend pagination), so TanStack's
//   own pagination + sorting row models run entirely in the browser.

import { type ReactNode, useState } from 'react'

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState
} from '@tanstack/react-table'

import Card from '@/components/ui/Card'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {

    /** Cell/header text alignment; defaults to 'left'. */
    align?: 'left' | 'right' | 'center'
  }
}

export type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T, any>[]
  isLoading?: boolean

  /** True while a background refetch is running and stale rows are still shown — dims rows instead of the "no data" state. */
  isRefetching?: boolean
  emptyMessage?: string
  toolbar?: ReactNode
  pageSizeOptions?: number[]

  /** Default true: pagination/sorting are server-driven via the props below. Pass false when the full dataset is already loaded. */
  manualPagination?: boolean
  total?: number
  pagination?: PaginationState
  onPaginationChange?: (updater: PaginationState) => void

  /** Controlled sorting (manual mode only) — omit to leave columns unsortable. */
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
}

function DataTable<T>({
  data,
  columns,
  isLoading = false,
  isRefetching = false,
  emptyMessage = 'No records found',
  toolbar,
  pageSizeOptions = [10, 20, 50],
  manualPagination = true,
  total,
  pagination,
  onPaginationChange,
  sorting: controlledSorting,
  onSortingChange
}: DataTableProps<T>) {
  // Uncontrolled fallbacks for client mode.
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] ?? 10
  })

  const [internalSorting, setInternalSorting] = useState<SortingState>([])

  const sortingEnabled = manualPagination ? Boolean(onSortingChange) : true
  const activePagination = manualPagination ? pagination! : internalPagination
  const activeSorting = manualPagination ? (controlledSorting ?? []) : internalSorting

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: activePagination,
      ...(sortingEnabled ? { sorting: activeSorting } : {})
    },
    manualPagination,
    manualSorting: manualPagination,
    rowCount: manualPagination ? total : undefined,
    onPaginationChange: manualPagination
      ? updater => {
          const next = typeof updater === 'function' ? updater(activePagination) : updater

          onPaginationChange?.(next)
        }
      : setInternalPagination,
    onSortingChange: sortingEnabled
      ? updater => {
          const next = typeof updater === 'function' ? updater(activeSorting) : updater

          if (manualPagination) onSortingChange?.(next)
          else setInternalSorting(next)
        }
      : undefined,
    enableSorting: sortingEnabled,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    ...(sortingEnabled ? { getSortedRowModel: getSortedRowModel() } : {})
  })

  const rows = table.getRowModel().rows
  const showSkeleton = isLoading && data.length === 0
  const showEmpty = !isLoading && rows.length === 0

  return (
    <Card>
      {toolbar}
      {(isLoading || isRefetching) && (
        <div className='h-1 w-full overflow-hidden bg-primary/15'>
          <div className='h-full w-1/3 animate-pulse bg-primary' />
        </div>
      )}
      <Table>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const align = header.column.columnDef.meta?.align ?? 'left'
                const canSort = sortingEnabled && header.column.getCanSort()
                const sortDir = header.column.getIsSorted()

                return (
                  <TableHeaderCell
                    key={header.id}
                    align={align}
                    style={header.column.columnDef.size !== undefined ? { width: header.column.columnDef.size } : undefined}
                    className={canSort ? 'cursor-pointer select-none' : undefined}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <span className='inline-flex items-center gap-1'>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <i
                          className={
                            sortDir === 'asc'
                              ? 'tabler-chevron-up text-[14px]'
                              : sortDir === 'desc'
                                ? 'tabler-chevron-down text-[14px]'
                                : 'tabler-selector text-[14px] opacity-40'
                          }
                        />
                      )}
                    </span>
                  </TableHeaderCell>
                )
              })}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {showSkeleton ? (
            Array.from({ length: Math.min(activePagination?.pageSize ?? 5, 5) }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                {columns.map((_, ci) => (
                  <TableCell key={ci}>
                    <span className='block h-4 w-full animate-pulse rounded bg-textDisabled/20' />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : showEmpty ? (
            <TableRow>
              <TableCell colSpan={columns.length} align='center' className='py-16 text-textSecondary'>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map(row => (
              <TableRow key={row.id} hover className={isRefetching ? 'opacity-50 transition-opacity' : undefined}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} align={cell.column.columnDef.meta?.align ?? 'left'}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {(() => {
        const rowCount = manualPagination ? (total ?? 0) : data.length
        const pageCount = Math.max(1, Math.ceil(rowCount / activePagination.pageSize))
        const from = rowCount === 0 ? 0 : activePagination.pageIndex * activePagination.pageSize + 1
        const to = Math.min((activePagination.pageIndex + 1) * activePagination.pageSize, rowCount)

        const setPage = (page: number) => {
          const next = { ...activePagination, pageIndex: page }

          if (manualPagination) onPaginationChange?.(next)
          else setInternalPagination(next)
        }

        const setPageSize = (pageSize: number) => {
          const next = { pageIndex: 0, pageSize }

          if (manualPagination) onPaginationChange?.(next)
          else setInternalPagination(next)
        }

        return (
          <div className='flex flex-wrap items-center justify-between gap-4 border-t border-secondary/20 p-4'>
            <div className='flex items-center gap-4'>
              <span className='text-sm text-textDisabled'>{`Showing ${from} to ${to} of ${rowCount} entries`}</span>
              <Select
                aria-label='Rows per page'
                value={activePagination.pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                options={pageSizeOptions.map(size => ({ label: String(size), value: size }))}
                className='h-9 w-[70px]'
              />
            </div>
            <Pagination count={pageCount} page={activePagination.pageIndex + 1} onChange={page => setPage(page - 1)} />
          </div>
        )
      })()}
    </Card>
  )
}

export default DataTable
