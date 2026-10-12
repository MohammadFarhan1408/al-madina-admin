'use client'

// Activity log — who changed what in the admin, newest first. Admin role only
// (the API refuses managers); read-only.
import { useMemo, useState } from 'react'

import type { ColumnDef, PaginationState } from '@tanstack/react-table'

import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import MobileRow from '@/components/shared/MobileRow'
import PageHeader from '@/components/shared/PageHeader'
import SearchField from '@/components/shared/SearchField'
import StatusChip from '@/components/shared/StatusChip'
import Button from '@/components/ui/Button'
import DateRangeFilter from '@/components/shared/DateRangeFilter'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useListTotals } from '@/hooks/useListTotals'
import { dateRangeParams, hasDateRange, type DateRange } from '@/libs/dateRange'
import { activityApi } from '@/features/activity/api/activityApi'
import { useFilterReset } from '@/hooks/useFilterReset'
import { formatDateTime } from '@/libs/format'
import { useActivity } from '@/features/activity/hooks/useActivity'
import { describeAction, type ActivityEntry, type ActivityMethod } from '@/features/activity/types'

// The admin API has no PUT routes, so "Replaced" would always be an empty tab.
const TAB_METHODS = ['POST', 'PATCH', 'DELETE'] as const satisfies readonly ActivityMethod[]

const METHOD_LABELS: Record<(typeof TAB_METHODS)[number], string> = {
  POST: 'Created',
  PATCH: 'Updated',
  DELETE: 'Deleted'
}

const resultChip = (code?: number) =>
  code ? (
    <StatusChip value={code < 400 ? `ok ${code}` : `failed ${code}`} color={code < 400 ? 'success' : 'error'} />
  ) : (
    '—'
  )

const ActivityView = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [method, setMethod] = useState<ActivityMethod | ''>('')
  const [dateRange, setDateRange] = useState<DateRange>({})
  const { search, setSearch, debouncedSearch } = useDebouncedSearch(setPagination)
  const resetOnChange = useFilterReset(setPagination)
  const hasFilters = Boolean(search || method || hasDateRange(dateRange))

  // Calendar days in local time: from the start of `from` to the end of `to`.
  const baseFilters = { q: debouncedSearch || undefined, ...dateRangeParams(dateRange) }

  const { data, isLoading, isFetching, isError, error, refetch } = useActivity({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...baseFilters,
    method: method || undefined
  })

  const methodTotals = useListTotals(
    ['activity', 'method-totals', baseFilters],
    ['all', ...TAB_METHODS] as const,
    key => activityApi.list({ ...baseFilters, method: key === 'all' ? undefined : key, page: 1, limit: 1 })
  )

  const clearFilters = () => {
    setSearch('')
    setMethod('')
    setDateRange({})
    setPagination(p => ({ ...p, pageIndex: 0 }))
  }

  const columns = useMemo<ColumnDef<ActivityEntry, any>[]>(
    () => [
      {
        header: 'When',
        accessorKey: 'createdAt',
        enableSorting: false,
        cell: ({ getValue }) => <span className='whitespace-nowrap'>{formatDateTime(getValue() as string)}</span>
      },
      {
        header: 'Who',
        accessorKey: 'actorEmail',
        enableSorting: false,
        cell: ({ getValue }) => (getValue() as string) || '—'
      },
      {
        header: 'Action',
        enableSorting: false,
        cell: ({ row }) => <span className='text-sm font-medium'>{describeAction(row.original)}</span>
      },
      {
        header: 'Result',
        accessorKey: 'statusCode',
        enableSorting: false,
        cell: ({ getValue }) => resultChip(getValue() as number)
      },
      { header: 'IP', accessorKey: 'ip', enableSorting: false, cell: ({ getValue }) => (getValue() as string) || '—' }
    ],
    []
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader title='Activity' subtitle='Every change made in the admin, newest first' />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        mobileCard={entry => (
          <MobileRow
            title={describeAction(entry)}
            trailing={resultChip(entry.statusCode)}
            meta={[entry.actorEmail ?? '—', formatDateTime(entry.createdAt)]}
          />
        )}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        isError={isError}
        errorMessage={(error as Error)?.message}
        onRetry={() => refetch()}
        itemLabel={{ one: 'change', other: 'changes' }}
        tabs={{
          label: 'Change type',
          value: method ? method.toLowerCase() : 'all',
          onChange: v => resetOnChange(setMethod)(TAB_METHODS.find(m => m.toLowerCase() === v) ?? ''),
          items: [
            { value: 'all', label: 'All changes', count: methodTotals.all },
            ...TAB_METHODS.map(m => ({ value: m.toLowerCase(), label: METHOD_LABELS[m], count: methodTotals[m] }))
          ]
        }}
        emptyIcon='tabler-history'
        emptyMessage={hasFilters ? 'No activity matches these filters' : 'No activity yet'}
        emptyDescription={
          hasFilters ? 'Try a wider date range or clear the filters.' : 'Changes made in the admin will be listed here.'
        }
        toolbar={
          <>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder='Search person or area…'
              tone='subtle'
              className='min-w-full flex-1 sm:min-w-56'
            />
            <DateRangeFilter label='When' value={dateRange} onChange={resetOnChange(setDateRange)} />
            {hasFilters && (
              <Button startIcon={<i className='tabler-x' />} variant='text' color='secondary' onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </>
        }
      />
    </>
  )
}

export default ActivityView
