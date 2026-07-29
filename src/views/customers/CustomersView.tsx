'use client'

// Customers management — server-paginated table, search + tier filter,
// navigates to a dedicated Detail page, and deactivate action. No
// create/edit routes — customers self-register.
import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import SearchField from '@/components/shared/SearchField'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Alert from '@/components/ui/Alert'
import Select from '@/components/ui/Select'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFilterReset } from '@/hooks/useFilterReset'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatDate } from '@/libs/format'
import { useCustomers, useDeactivateCustomer } from '@/features/customers/hooks/useCustomers'
import { USER_TIERS, type Customer, type UserTier } from '@/features/customers/types'

const CustomersView = () => {
  const router = useRouter()
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState<UserTier | ''>('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [toDeactivate, setToDeactivate] = useState<Customer | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const resetOnChange = useFilterReset(setPagination)

  const deactivateMutation = useDeactivateCustomer()
  const { success, error: toastError } = useToast()

  const { data, isLoading, isFetching, isError, error } = useCustomers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    tier: tier || undefined,
    q: debouncedSearch || undefined,
    sortBy: (sorting[0]?.id as 'fullName' | 'email' | 'tier' | 'memberSince') || undefined,
    sortOrder: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined
  })

  const confirmDeactivate = async () => {
    if (!toDeactivate) return

    try {
      await deactivateMutation.mutateAsync(toDeactivate.id)
      success('Customer deactivated')
      setToDeactivate(null)
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to deactivate customer'))
    }
  }

  const columns = useMemo<ColumnDef<Customer, any>[]>(
    () => [
      {
        header: 'Customer',
        accessorKey: 'fullName',
        cell: ({ row }) => (
          <div className='flex cursor-pointer items-center gap-3' onClick={() => router.push(`/customers/${row.original.id}`)}>
            {row.original.avatar ? (
              <img src={row.original.avatar} alt='' className='size-10 rounded-full object-cover' />
            ) : (
              <span className='flex size-10 items-center justify-center rounded-full bg-secondary/15 text-sm font-medium'>
                {row.original.fullName?.charAt(0)}
              </span>
            )}
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>{row.original.fullName}</span>
              <span className='text-xs text-textSecondary'>{row.original.email}</span>
            </div>
          </div>
        )
      },
      {
        header: 'Tier',
        accessorKey: 'tier',
        cell: ({ getValue }) => <StatusChip value={getValue() as string} />
      },
      {
        header: 'Status',
        accessorKey: 'isActive',
        enableSorting: false,
        cell: ({ getValue }) => <StatusChip value={(getValue() as boolean) ? 'active' : 'inactive'} />
      },
      {
        header: 'Member since',
        accessorKey: 'memberSince',
        cell: ({ row }) => formatDate(row.original.memberSince || row.original.createdAt)
      },
      {
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <button
              type='button'
              aria-label={`View ${row.original.fullName}`}
              onClick={() => router.push(`/customers/${row.original.id}`)}
              className='rounded-md p-1.5 text-textSecondary hover:bg-primary/10'
            >
              <i className='tabler-eye' />
            </button>
            <button
              type='button'
              aria-label={`Deactivate ${row.original.fullName}`}
              disabled={!row.original.isActive}
              onClick={() => setToDeactivate(row.original)}
              className='rounded-md p-1.5 text-error hover:bg-error/10 disabled:opacity-40'
            >
              <i className='tabler-user-off' />
            </button>
          </div>
        )
      }
    ],
    [router]
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader title='Customers' subtitle='Your registered account holders' />

      {isError && (
        <Alert severity='error' className='mb-4'>
          {(error as Error)?.message || 'Failed to load customers.'}
        </Alert>
      )}

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        emptyMessage='No customers found'
        toolbar={
          <div className='flex flex-wrap items-center gap-4 p-6'>
            <SearchField
              value={search}
              onChange={resetOnChange(setSearch)}
              placeholder='Search name or email'
              className='min-w-[220px]'
            />
            <Select
              label='Tier'
              value={tier}
              onChange={e => resetOnChange(setTier)(e.target.value as UserTier | '')}
              containerClassName='min-w-[200px]'
              options={[{ label: 'All tiers', value: '' }, ...USER_TIERS.map(t => ({ label: t, value: t }))]}
            />
          </div>
        }
      />

      <ConfirmDialog
        open={!!toDeactivate}
        title='Deactivate customer'
        description={`Deactivate ${toDeactivate?.fullName}? They will lose account access.`}
        confirmText='Deactivate'
        loading={deactivateMutation.isPending}
        onConfirm={confirmDeactivate}
        onClose={() => setToDeactivate(null)}
      />
    </>
  )
}

export default CustomersView
