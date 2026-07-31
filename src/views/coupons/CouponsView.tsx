'use client'

// Coupons management — server-paginated table, active filter, navigates to
// dedicated Create/Edit pages (no Detail page — fields fit as list columns),
// delete confirm. Admin-only (no public read endpoint).
import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { ColumnDef, PaginationState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import RowActions from '@/components/shared/RowActions'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { useFilterReset } from '@/hooks/useFilterReset'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, formatDate } from '@/libs/format'
import CouponsFilterBar, { type CouponsStatusFilter } from '@/features/coupons/components/CouponsFilterBar'
import { useCoupons, useDeleteCoupon } from '@/features/coupons/hooks/useCoupons'
import type { Coupon } from '@/features/coupons/types'

const CouponsView = () => {
  const router = useRouter()
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [isActive, setIsActive] = useState<CouponsStatusFilter>('')
  const [toDelete, setToDelete] = useState<Coupon | null>(null)
  const hasFilters = isActive !== ''
  const resetOnChange = useFilterReset(setPagination)

  const clearFilters = () => {
    setIsActive('')
    setPagination(p => ({ ...p, pageIndex: 0 }))
  }

  const deleteMutation = useDeleteCoupon()
  const { success, error: toastError } = useToast()

  const { data, isLoading, isFetching, isError, error } = useCoupons({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    isActive: isActive === '' ? undefined : isActive === 'true'
  })

  const confirmDelete = async () => {
    if (!toDelete) return

    try {
      await deleteMutation.mutateAsync(toDelete.id)
      success('Coupon deleted')
      setToDelete(null)
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete coupon'))
    }
  }

  const columns = useMemo<ColumnDef<Coupon, any>[]>(
    () => [
      {
        header: 'Code',
        accessorKey: 'code',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <span className='text-sm font-medium'>{row.original.code}</span>
            <span className='text-xs text-textSecondary'>{row.original.description}</span>
          </div>
        )
      },
      {
        header: 'Discount',
        cell: ({ row }) =>
          row.original.discountType === 'percentage'
            ? `${row.original.value}%`
            : formatCurrency(row.original.value, row.original.currency)
      },
      {
        header: 'Usage',
        meta: { align: 'right' },
        cell: ({ row }) => `${row.original.usageCount}${row.original.usageLimit ? ` / ${row.original.usageLimit}` : ''}`
      },
      {
        header: 'Expires',
        accessorKey: 'expiresAt',
        cell: ({ getValue }) => formatDate(getValue() as string)
      },
      {
        header: 'Status',
        accessorKey: 'isActive',
        cell: ({ getValue }) => <StatusChip value={(getValue() as boolean) ? 'active' : 'inactive'} />
      },
      {
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <RowActions
              options={[
                { text: 'Edit', icon: 'tabler-edit', onClick: () => router.push(`/coupons/${row.original.id}/edit`) },
                { text: 'Delete', icon: 'tabler-trash', danger: true, onClick: () => setToDelete(row.original) }
              ]}
            />
          </div>
        )
      }
    ],
    [router]
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title='Coupons'
        subtitle='Discount codes for campaigns and promotions'
        action={
          <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/coupons/new')}>
            Add Coupon
          </Button>
        }
      />

      {isError && (
        <Alert severity='error' className='mb-4'>
          {(error as Error)?.message || 'Failed to load coupons.'}
        </Alert>
      )}

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        emptyIcon='tabler-discount-off'
        emptyMessage={hasFilters ? 'No coupons with this status' : 'No coupons yet'}
        emptyDescription={
          hasFilters
            ? 'Switch the status filter to see the rest of your coupons.'
            : 'Create a discount code to run a promotion.'
        }
        emptyAction={
          !hasFilters && (
            <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/coupons/new')}>
              Add Coupon
            </Button>
          )
        }
        toolbar={
          <CouponsFilterBar
            isActive={isActive}
            onIsActiveChange={resetOnChange(setIsActive)}
            hasFilters={hasFilters}
            onClearFilters={clearFilters}
          />
        }
      />

      <ConfirmDialog
        open={!!toDelete}
        title='Delete coupon'
        description={`Delete "${toDelete?.code}"? This cannot be undone.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

export default CouponsView
