'use client'

// Generic table built on TanStack Table + MUI, in two modes:
// - manual (default): pagination/sorting state is owned by the caller and
//   forwarded to the backend (page/limit≤50 per doc §7).
// - client (`manualPagination={false}`): the full dataset is already loaded
//   (e.g. Categories/Collections have no backend pagination), so TanStack's
//   own pagination + sorting row models run entirely in the browser.

import { type ReactNode, useState } from 'react'

import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'

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
  const theme = useTheme()

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

  const rows = manualPagination ? table.getRowModel().rows : table.getRowModel().rows
  const showSkeleton = isLoading && data.length === 0
  const showEmpty = !isLoading && rows.length === 0

  return (
    <Card>
      {toolbar}
      {(isLoading || isRefetching) && <LinearProgress />}
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: theme.palette.customColors.tableHeaderBg }}>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const align = header.column.columnDef.meta?.align ?? 'left'
                  const canSort = sortingEnabled && header.column.getCanSort()
                  const sortDir = header.column.getIsSorted()

                  return (
                    <TableCell
                      key={header.id}
                      align={align}
                      sx={{
                        whiteSpace: 'nowrap',
                        ...(header.column.columnDef.size !== undefined ? { width: header.column.columnDef.size } : {}),
                        ...(canSort ? { cursor: 'pointer', userSelect: 'none' } : {})
                      }}
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
                    </TableCell>
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
                      <Skeleton variant='text' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : showEmpty ? (
              <TableRow>
                <TableCell colSpan={columns.length} align='center' sx={{ py: 8 }}>
                  <Typography color='text.secondary'>{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={row.id} hover sx={isRefetching ? { opacity: 0.5, transition: 'opacity 0.15s' } : undefined}>
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
      </TableContainer>
      <TablePagination
        component='div'
        count={manualPagination ? (total ?? 0) : data.length}
        page={activePagination.pageIndex}
        rowsPerPage={activePagination.pageSize}
        rowsPerPageOptions={pageSizeOptions}
        onPageChange={(_, page) => {
          const next = { ...activePagination, pageIndex: page }

          if (manualPagination) onPaginationChange?.(next)
          else setInternalPagination(next)
        }}
        onRowsPerPageChange={e => {
          const next = { pageIndex: 0, pageSize: parseInt(e.target.value, 10) }

          if (manualPagination) onPaginationChange?.(next)
          else setInternalPagination(next)
        }}
      />
    </Card>
  )
}

export default DataTable
