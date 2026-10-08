'use client'

// Customers management — server-paginated table, search + tier filter,
// navigates to a dedicated Detail page, and deactivate action. No
// create/edit routes — customers self-register.
import { useCallback, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

import EntityCell from '@/components/shared/EntityCell'
import MobileRow from '@/components/shared/MobileRow'
import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Alert from '@/components/ui/Alert'
import IconButton from '@/components/ui/IconButton'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFilterReset } from '@/hooks/useFilterReset'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, formatDate } from '@/libs/format'
import CustomersFilterBar from '@/features/customers/components/CustomersFilterBar'
import { useCustomers, useDeactivateCustomer, useReactivateCustomer } from '@/features/customers/hooks/useCustomers'
import type { Customer, UserTier } from '@/features/customers/types'

const CustomersView = () => {
  const router = useRouter()
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState<UserTier | ''>('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [toDeactivate, setToDeactivate] = useState<Customer | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const hasFilters = Boolean(search || tier)
  const resetOnChange = useFilterReset(setPagination)

  const clearFilters = () => {
    setSearch('')
    setTier('')
    setPagination(p => ({ ...p, pageIndex: 0 }))
  }

  const deactivateMutation = useDeactivateCustomer()
  const reactivateMutation = useReactivateCustomer()
  const { success, error: toastError, toast } = useToast()

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

  const { mutateAsync: reactivate } = reactivateMutation
  const { mutate: deactivate } = deactivateMutation

  // Reversible, so no confirm dialog: act, then offer Undo.
  const reactivateCustomer = useCallback(
    async (customer: Customer) => {
      try {
        await reactivate(customer.id)
        toast('Customer reactivated', 'success', { label: 'Undo', onClick: () => deactivate(customer.id) })
      } catch (err) {
        toastError(getErrorMessage(err, 'Failed to reactivate customer'))
      }
    },
    [reactivate, deactivate, toast, toastError]
  )

  const columns = useMemo<ColumnDef<Customer, any>[]>(
    () => [
      {
        header: 'Customer',
        accessorKey: 'fullName',
        cell: ({ row }) => (
          <EntityCell
            round
            name={row.original.fullName}
            subtitle={row.original.email}
            image={row.original.avatar}
            onClick={() => router.push(`/customers/${row.original.id}`)}
          />
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
        header: 'Orders',
        accessorKey: 'orderCount',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ getValue }) => <span className='tabular-nums'>{(getValue() as number | undefined) ?? 0}</span>
      },
      {
        header: 'Total spent',
        accessorKey: 'totalSpent',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ getValue }) => (
          <span className='tabular-nums'>{formatCurrency((getValue() as number | undefined) ?? 0)}</span>
        )
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
            <IconButton
              size='sm'
              aria-label={`View ${row.original.fullName}`}
              onClick={() => router.push(`/customers/${row.original.id}`)}
            >
              <i className='tabler-eye' />
            </IconButton>
            {row.original.isActive ? (
              <IconButton
                size='sm'
                color='error'
                aria-label={`Deactivate ${row.original.fullName}`}
                onClick={() => setToDeactivate(row.original)}
              >
                <i className='tabler-user-off' />
              </IconButton>
            ) : (
              <IconButton
                size='sm'
                aria-label={`Reactivate ${row.original.fullName}`}
                onClick={() => reactivateCustomer(row.original)}
              >
                <i className='tabler-user-check' />
              </IconButton>
            )}
          </div>
        )
      }
    ],
    [router, reactivateCustomer]
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
        mobileCard={customer => (
          <MobileRow
            title={
              <EntityCell
                round
                name={customer.fullName}
                subtitle={customer.email}
                image={customer.avatar}
                onClick={() => router.push(`/customers/${customer.id}`)}
              />
            }
            trailing={<StatusChip value={customer.tier} />}
            meta={[
              `${customer.orderCount ?? 0} orders`,
              formatCurrency(customer.totalSpent ?? 0),
              <StatusChip key='s' value={customer.isActive ? 'active' : 'inactive'} />
            ]}
            actions={
              customer.isActive ? (
                <IconButton
                  color='error'
                  aria-label={`Deactivate ${customer.fullName}`}
                  onClick={() => setToDeactivate(customer)}
                >
                  <i className='tabler-user-off' />
                </IconButton>
              ) : (
                <IconButton aria-label={`Reactivate ${customer.fullName}`} onClick={() => reactivateCustomer(customer)}>
                  <i className='tabler-user-check' />
                </IconButton>
              )
            }
          />
        )}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        emptyIcon='tabler-users-group'
        emptyMessage={hasFilters ? 'No customers match these filters' : 'No customers yet'}
        emptyDescription={
          hasFilters
            ? 'Try a different name, email or loyalty tier.'
            : 'Customers appear here once they register in the mobile app.'
        }
        toolbar={
          <CustomersFilterBar
            search={search}
            onSearchChange={resetOnChange(setSearch)}
            tier={tier}
            onTierChange={resetOnChange(setTier)}
            hasFilters={hasFilters}
            onClearFilters={clearFilters}
          />
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
