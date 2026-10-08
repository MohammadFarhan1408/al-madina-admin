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
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import DateInput from '@/components/ui/form/DateInput'
import Select from '@/components/ui/form/Select'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFilterReset } from '@/hooks/useFilterReset'
import { formatDateTime } from '@/libs/format'
import { useActivity } from '@/features/activity/hooks/useActivity'
import { ACTIVITY_METHODS, describeAction, type ActivityEntry, type ActivityMethod } from '@/features/activity/types'

const resultChip = (code?: number) =>
  code ? (
    <StatusChip value={code < 400 ? `ok ${code}` : `failed ${code}`} color={code < 400 ? 'success' : 'error'} />
  ) : (
    '—'
  )

const ActivityView = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState('')
  const [method, setMethod] = useState<ActivityMethod | ''>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const resetOnChange = useFilterReset(setPagination)
  const hasFilters = Boolean(search || method || from || to)

  const { data, isLoading, isFetching, isError, error, refetch } = useActivity({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    q: debouncedSearch || undefined,
    method: method || undefined,

    // Calendar days: from the start of `from` to the end of `to`, in local time.
    from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined
  })

  const clearFilters = () => {
    setSearch('')
    setMethod('')
    setFrom('')
    setTo('')
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

      {isError && (
        <Alert
          severity='error'
          className='mb-4'
          action={
            <Button size='sm' variant='outlined' color='error' onClick={() => refetch()}>
              Try again
            </Button>
          }
        >
          {(error as Error)?.message || 'Failed to load activity.'}
        </Alert>
      )}

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
        emptyIcon='tabler-history'
        emptyMessage={hasFilters ? 'No activity matches these filters' : 'No activity yet'}
        emptyDescription={
          hasFilters ? 'Try a wider date range or clear the filters.' : 'Changes made in the admin will be listed here.'
        }
        toolbar={
          <>
            <SearchField
              value={search}
              onChange={resetOnChange(setSearch)}
              placeholder='Search person or area'
              className='min-w-56 flex-1 self-end'
            />
            <Select
              label='Change'
              value={method}
              onChange={e => resetOnChange(setMethod)(e.target.value as ActivityMethod | '')}
              containerClassName='min-w-36 flex-1 sm:flex-none'
              options={[
                { label: 'All changes', value: '' },
                ...ACTIVITY_METHODS.map(m => ({
                  label: { POST: 'Created', PATCH: 'Updated', PUT: 'Replaced', DELETE: 'Deleted' }[m],
                  value: m
                }))
              ]}
            />
            <DateInput
              clearable
              label='From'
              value={from}
              max={to || undefined}
              onChange={e => resetOnChange(setFrom)(e.target.value)}
              containerClassName='min-w-36 flex-1 sm:flex-none sm:min-w-44'
            />
            <DateInput
              clearable
              label='To'
              value={to}
              min={from || undefined}
              onChange={e => resetOnChange(setTo)(e.target.value)}
              containerClassName='min-w-36 flex-1 sm:flex-none sm:min-w-44'
            />
            {hasFilters && (
              <Button
                startIcon={<i className='tabler-x' />}
                size='sm'
                variant='text'
                color='secondary'
                onClick={clearFilters}
              >
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
