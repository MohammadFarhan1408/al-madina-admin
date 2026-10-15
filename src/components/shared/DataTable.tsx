'use client'

// Generic table built on TanStack Table, in two modes:
// - manual (default): pagination/sorting state is owned by the caller and
//   forwarded to the backend (page/limit≤50 per doc §7).
// - client (`manualPagination={false}`): the full dataset is already loaded
//   (e.g. Categories/Collections have no backend pagination), so TanStack's
//   own pagination + sorting row models run entirely in the browser.

import { type ReactNode, useEffect, useMemo, useState } from 'react'

import classnames from 'classnames'
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

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Checkbox from '@/components/ui/form/Checkbox'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import SegmentedControl from '@/components/ui/form/SegmentedControl'
import Tabs, { type TabItem } from '@/components/ui/Tabs'
import Skeleton from '@/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'right' | 'center'
  }
}

export type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T, any>[]
  isLoading?: boolean

  /** True while a background refetch is running and stale rows are still shown — dims rows instead of the "no data" state. */
  isRefetching?: boolean

  /** Headline for the empty state. */
  emptyMessage?: string

  /** Tabler icon for the empty state, e.g. `tabler-package-off`. */
  emptyIcon?: string

  /** One line telling the user what would appear here, or how to widen a filter. */
  emptyDescription?: ReactNode

  /** The action that resolves an empty table — "Add product", "Clear filters". */
  emptyAction?: ReactNode

  /** True when the list query failed — shows an error state with Retry in
   *  place of the rows, instead of an empty state that claims there's no data. */
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void

  /** The list's primary segmentation (status, stock, tier…) as tabs across
   *  the top of the card, above the toolbar. Counts go in each item. */
  tabs?: { items: TabItem[]; value: string; onChange: (value: string) => void; label: string }

  /** What a row is, for the footer's "Showing 1–20 of 132 orders". */
  itemLabel?: { one: string; other: string }

  /** Filter/search controls. Pass the controls only — DataTable supplies the
   *  toolbar row, so its padding and alignment match the pagination footer
   *  instead of every view declaring its own wrapper. */
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

  /** 'grid' swaps the `<table>` body for a card grid built from `renderCard`,
   *  while the toolbar, loading bar, empty state and pagination footer stay
   *  exactly the ones the table view already uses — a toggle only needs a
   *  second renderer for the middle, not a second surface. */
  view?: 'table' | 'grid'
  renderCard?: (item: T) => ReactNode

  /** Loading placeholder for one grid card — pass the card's own skeleton so
   *  the grid keeps its shape when data lands. */
  renderCardSkeleton?: () => ReactNode
  gridClassName?: string

  /** Below `md`, render each row as a card instead of a scrolling table. Cards
   *  have no checkbox, so bulk selection is a desktop affordance. */
  mobileCard?: (item: T) => ReactNode

  /** Row checkboxes + a bulk bar. The caller owns the id set; ids that leave
   *  the current data (page or filter change, deletion) are pruned so a bulk
   *  action can never touch rows the user can no longer see. */
  selection?: {
    selected: Set<string>
    onChange: (selected: Set<string>) => void
    getId: (item: T) => string

    /** Bulk action buttons, shown with the "N selected" bar. */
    actions: ReactNode
  }
}

function DataTable<T>({
  data,
  columns,
  isLoading = false,
  isRefetching = false,
  emptyMessage = 'Nothing here yet',
  emptyIcon,
  emptyDescription,
  emptyAction,
  isError = false,
  errorMessage,
  onRetry,
  tabs,
  itemLabel = { one: 'result', other: 'results' },
  toolbar,
  pageSizeOptions = [10, 20, 50],
  manualPagination = true,
  total,
  pagination,
  onPaginationChange,
  sorting: controlledSorting,
  onSortingChange,
  view = 'table',
  renderCard,
  renderCardSkeleton,
  gridClassName,
  mobileCard,
  selection
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

  const selectedSet = selection?.selected
  const getId = selection?.getId
  const onSelectionChange = selection?.onChange

  const allColumns = useMemo<ColumnDef<T, any>[]>(() => {
    if (!selectedSet || !getId || !onSelectionChange) return columns

    const toggle = (ids: string[], on: boolean) => {
      const next = new Set(selectedSet)

      ids.forEach(id => (on ? next.add(id) : next.delete(id)))
      onSelectionChange(next)
    }

    return [
      {
        id: 'select',
        size: 40,
        enableSorting: false,
        header: ({ table }) => {
          const ids = table.getRowModel().rows.map(r => getId(r.original))
          const all = ids.length > 0 && ids.every(id => selectedSet.has(id))

          return (
            <Checkbox
              aria-label='Select all rows on this page'
              checked={all}
              indeterminate={!all && ids.some(id => selectedSet.has(id))}
              onChange={() => toggle(ids, !all)}
            />
          )
        },
        cell: ({ row }) => (
          <Checkbox
            aria-label='Select row'
            checked={selectedSet.has(getId(row.original))}
            onChange={e => toggle([getId(row.original)], e.target.checked)}
          />
        )
      },
      ...columns
    ]
  }, [columns, selectedSet, getId, onSelectionChange])

  useEffect(() => {
    if (!selectedSet?.size || !getId || !onSelectionChange) return

    const visible = new Set(data.map(getId))
    const kept = [...selectedSet].filter(id => visible.has(id))

    if (kept.length !== selectedSet.size) onSelectionChange(new Set(kept))
  }, [data, selectedSet, getId, onSelectionChange])

  // Client mode: a new dataset (a search narrowing a loaded list) restarts at
  // page 1 — otherwise page 3 of the old list could show as an empty page 3
  // of the new one. Done during render so no empty frame is ever painted.
  const [clientDataLength, setClientDataLength] = useState(data.length)

  if (!manualPagination && clientDataLength !== data.length) {
    setClientDataLength(data.length)
    if (internalPagination.pageIndex !== 0) setInternalPagination(p => ({ ...p, pageIndex: 0 }))
  }

  const table = useReactTable({
    data,
    columns: allColumns,
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

          // A new order reshuffles every page, so go back to the first.
          if (manualPagination) {
            onSortingChange?.(next)
            if (activePagination.pageIndex !== 0) onPaginationChange?.({ ...activePagination, pageIndex: 0 })
          } else {
            setInternalSorting(next)
            setInternalPagination(p => ({ ...p, pageIndex: 0 }))
          }
        }
      : undefined,
    enableSorting: sortingEnabled,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    ...(sortingEnabled ? { getSortedRowModel: getSortedRowModel() } : {})
  })

  const rows = table.getRowModel().rows
  const showSkeleton = isLoading && data.length === 0 && !isError
  const showError = isError && !isLoading && data.length === 0
  const showEmpty = !isLoading && !showError && rows.length === 0

  const rowCount = manualPagination ? (total ?? 0) : data.length
  const pageCount = Math.max(1, Math.ceil(rowCount / activePagination.pageSize))
  const from = rowCount === 0 ? 0 : activePagination.pageIndex * activePagination.pageSize + 1
  const to = Math.min((activePagination.pageIndex + 1) * activePagination.pageSize, rowCount)

  // Manual mode: if the current page no longer exists (the last row of the
  // last page was deleted, or the total shrank under a refetch), step back to
  // the last real page rather than showing an empty one.
  useEffect(() => {
    if (!manualPagination || isLoading || isRefetching || total === undefined) return

    if (activePagination.pageIndex > 0 && activePagination.pageIndex >= pageCount) {
      onPaginationChange?.({ ...activePagination, pageIndex: pageCount - 1 })
    }
  }, [manualPagination, isLoading, isRefetching, total, pageCount, activePagination, onPaginationChange])

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

  const errorState = (
    <EmptyState
      icon='tabler-alert-triangle'
      title={`Couldn't load ${itemLabel.other}`}
      description={errorMessage || 'Something went wrong while loading this list.'}
      action={
        onRetry ? (
          <Button variant='outlined' startIcon={<i className='tabler-refresh' />} onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    />
  )

  const body = (
    <>
      {toolbar && <div className='flex flex-wrap items-center gap-2 border-b border-border px-4 py-3'>{toolbar}</div>}

      {selection && selection.selected.size > 0 && (
        <div className='flex flex-wrap items-center gap-3 border-b border-border bg-primary/10 px-4 py-2.5 text-sm'>
          <span className='font-medium'>{selection.selected.size} selected</span>
          <Button
            size='sm'
            variant='text'
            color='secondary'
            startIcon={<i className='tabler-x' />}
            onClick={() => selection.onChange(new Set())}
          >
            Clear
          </Button>
          <div className='ml-auto flex items-center gap-2'>{selection.actions}</div>
        </div>
      )}

      {/* Indeterminate progress bar for background refetches. Fixed height so
          it never nudges the table when it appears and disappears. */}
      <div aria-hidden className={isLoading ? 'h-0.5 w-full overflow-hidden bg-transparent' : ''}>
        {(isLoading || isRefetching) && (
          <div className='h-full w-full bg-primary/20'>
            <div className='h-full w-1/4 animate-indeterminate rounded-full bg-primaryDark' />
          </div>
        )}
      </div>

      {showError ? (
        errorState
      ) : view === 'grid' && renderCard ? (
        showSkeleton ? (
          <div className={gridClassName ?? 'grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-4'}>
            {Array.from({ length: Math.min(activePagination?.pageSize ?? 8, 8) }).map((_, i) =>
              renderCardSkeleton ? (
                <div key={`skeleton-${i}`}>{renderCardSkeleton()}</div>
              ) : (
                <div key={`skeleton-${i}`} className='flex flex-col gap-2 rounded-lg border border-border p-3'>
                  <Skeleton variant='block' className='aspect-square w-full' />
                  <Skeleton className='w-3/4' />
                  <Skeleton className='w-1/2' />
                </div>
              )
            )}
          </div>
        ) : showEmpty ? (
          <EmptyState icon={emptyIcon} title={emptyMessage} description={emptyDescription} action={emptyAction} />
        ) : (
          <div
            aria-busy={isLoading || isRefetching || undefined}
            className={classnames(
              gridClassName ?? 'grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-4',
              isRefetching && 'opacity-60 transition-opacity'
            )}
          >
            {rows.map(row => (
              <div key={row.id}>{renderCard(row.original)}</div>
            ))}
          </div>
        )
      ) : (
        <>
          {mobileCard && (
            <ul
              aria-busy={isLoading || isRefetching || undefined}
              className='flex flex-col divide-y divide-border md:hidden'
            >
              {showSkeleton ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className='flex flex-col gap-2 p-4'>
                    <Skeleton className='w-2/3' />
                    <Skeleton className='w-1/3' />
                  </li>
                ))
              ) : showEmpty ? (
                <li>
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyMessage}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </li>
              ) : (
                rows.map(row => (
                  <li key={row.id} className={classnames('p-4', isRefetching && 'opacity-60 transition-opacity')}>
                    {mobileCard(row.original)}
                  </li>
                ))
              )}
            </ul>
          )}
          <div className={mobileCard ? 'max-md:hidden' : undefined}>
            <Table aria-busy={isLoading || isRefetching || undefined}>
              <TableHead>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      const canSort = sortingEnabled && header.column.getCanSort()

                      return (
                        <TableHeaderCell
                          key={header.id}
                          align={header.column.columnDef.meta?.align ?? 'left'}
                          style={
                            header.column.columnDef.size !== undefined
                              ? { width: header.column.columnDef.size }
                              : undefined
                          }
                          sortDirection={header.column.getIsSorted()}
                          onSort={canSort ? () => header.column.toggleSorting() : undefined}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHeaderCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {showSkeleton ? (
                  Array.from({ length: Math.min(activePagination?.pageSize ?? 5, 6) }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {allColumns.map((_, ci) => (
                        <TableCell key={ci}>
                          <Skeleton className={ci === 0 ? 'w-3/4' : ci % 3 === 0 ? 'w-1/2' : 'w-2/3'} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : showEmpty ? (
                  <TableRow>
                    <TableCell colSpan={allColumns.length} className='p-0'>
                      <EmptyState
                        icon={emptyIcon}
                        title={emptyMessage}
                        description={emptyDescription}
                        action={emptyAction}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map(row => (
                    <TableRow key={row.id} hover className={isRefetching ? 'opacity-60 transition-opacity' : undefined}>
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
          </div>
        </>
      )}

      {/* The footer is dead weight on an empty or failed table — hide it rather
          than show "0 results" under a state that already says so. */}
      {!showEmpty && !showError && (
        <div className='flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-textSecondary' aria-live='polite'>
            {showSkeleton ? (
              'Loading…'
            ) : pageCount > 1 ? (
              <>
                Showing{' '}
                <span className='font-medium tabular-nums text-textPrimary'>
                  {from}–{to}
                </span>{' '}
                of <span className='font-medium tabular-nums text-textPrimary'>{rowCount}</span>{' '}
                {rowCount === 1 ? itemLabel.one : itemLabel.other}
              </>
            ) : (
              <>
                <span className='font-medium tabular-nums text-textPrimary'>{rowCount}</span>{' '}
                {rowCount === 1 ? itemLabel.one : itemLabel.other}
              </>
            )}
          </p>
          <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:justify-end'>
            {/* Page size only matters once there's more than the smallest page. */}
            {rowCount > (pageSizeOptions[0] ?? 0) && (
              <div className='flex items-center gap-2'>
                <span className='text-xs text-textMuted' aria-hidden>
                  Rows
                </span>
                <SegmentedControl
                  size='sm'
                  aria-label='Rows per page'
                  value={String(activePagination.pageSize)}
                  onChange={v => setPageSize(Number(v))}
                  options={pageSizeOptions.map(size => ({ label: String(size), value: String(size) }))}
                />
              </div>
            )}
            <Pagination count={pageCount} page={activePagination.pageIndex + 1} onChange={page => setPage(page - 1)} />
          </div>
        </div>
      )}
    </>
  )

  return (
    <Card className='overflow-hidden'>
      {tabs ? (
        <>
          <Tabs items={tabs.items} value={tabs.value} onChange={tabs.onChange} label={tabs.label} className='px-2' />
          <div role='tabpanel' id={`${tabs.value}-panel`} aria-labelledby={`${tabs.value}-tab`}>
            {body}
          </div>
        </>
      ) : (
        body
      )}
    </Card>
  )
}

export default DataTable
