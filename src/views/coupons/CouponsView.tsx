'use client'

// Coupons management — server-paginated table, active filter, navigates to
// dedicated Create/Edit pages (no Detail page — fields fit as list columns),
// delete confirm. Admin-only (no public read endpoint).
import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { ColumnDef, PaginationState } from '@tanstack/react-table'

import MobileRow from '@/components/shared/MobileRow'
import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import RowActions from '@/components/shared/RowActions'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { useFilterReset } from '@/hooks/useFilterReset'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { formatCurrency, formatDate } from '@/libs/format'
import { couponsApi } from '@/features/coupons/api/couponsApi'
import { couponKeys, useCoupons, useDeleteCoupon } from '@/features/coupons/hooks/useCoupons'
import { useListTotals } from '@/hooks/useListTotals'

type CouponsStatusFilter = '' | 'true' | 'false'
import type { Coupon } from '@/features/coupons/types'

/** `isActive` alone says "Active" for a coupon that can no longer be redeemed;
 *  surface why it is dead. */
const couponState = (c: Coupon) => {
  if (!c.isActive) return 'inactive'
  if (new Date(c.expiresAt).getTime() < Date.now()) return 'expired'
  if (c.usageLimit && c.usageCount >= c.usageLimit) return 'exhausted'

  return 'active'
}

const CouponsView = () => {
  const router = useRouter()
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [isActive, setIsActive] = useState<CouponsStatusFilter>('')
  const hasFilters = isActive !== ''
  const resetOnChange = useFilterReset(setPagination)

  const deleteMutation = useDeleteCoupon()

  const { ask, dialog } = useConfirmDelete<Coupon>({
    entity: 'coupon',
    remove: c => deleteMutation.mutateAsync(c.id),
    name: c => c.code
  })

  const { data, isLoading, isFetching, isError, error, refetch } = useCoupons({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    isActive: isActive === '' ? undefined : isActive === 'true'
  })

  const statusTotals = useListTotals([...couponKeys.all, 'status-totals'], ['all', 'true', 'false'] as const, key =>
    couponsApi.list({ isActive: key === 'all' ? undefined : key === 'true', page: 1, limit: 1 })
  )

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
        cell: ({ row }) => <StatusChip value={couponState(row.original)} />
      },
      {
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <RowActions
              options={[
                { text: 'Edit', icon: 'tabler-edit', onClick: () => router.push(`/coupons/${row.original.id}/edit`) },
                { text: 'Delete', icon: 'tabler-trash', danger: true, onClick: () => ask(row.original) }
              ]}
            />
          </div>
        )
      }
    ],
    [router, ask]
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title='Coupons'
        icon='tabler-discount'
        subtitle='Discount codes for campaigns and promotions'
        action={
          <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/coupons/new')}>
            Add Coupon
          </Button>
        }
      />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        mobileCard={coupon => (
          <MobileRow
            onClick={() => router.push(`/coupons/${coupon.id}/edit`)}
            title={coupon.code}
            trailing={<StatusChip value={couponState(coupon)} />}
            meta={[
              coupon.description,
              coupon.discountType === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value, coupon.currency),
              `Expires ${formatDate(coupon.expiresAt)}`
            ]}
            actions={
              <IconButton color='error' aria-label={`Delete ${coupon.code}`} onClick={() => ask(coupon)}>
                <i className='tabler-trash' />
              </IconButton>
            }
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
        itemLabel={{ one: 'coupon', other: 'coupons' }}

        // The API filters on the on/off switch (isActive) only, so the tabs
        // say Enabled/Disabled: an enabled coupon can still show Expired or
        // Exhausted in its Status column.
        tabs={{
          label: 'Coupon status',
          value: isActive === '' ? 'all' : isActive === 'true' ? 'enabled' : 'disabled',
          onChange: v => resetOnChange(setIsActive)(v === 'enabled' ? 'true' : v === 'disabled' ? 'false' : ''),
          items: [
            { value: 'all', label: 'All coupons', count: statusTotals.all },
            { value: 'enabled', label: 'Enabled', count: statusTotals.true },
            { value: 'disabled', label: 'Disabled', count: statusTotals.false }
          ]
        }}
        emptyIcon='tabler-discount-off'
        emptyMessage={hasFilters ? `No ${isActive === 'true' ? 'enabled' : 'disabled'} coupons` : 'No coupons yet'}
        emptyDescription={
          hasFilters ? 'Switch tabs to see the rest of your coupons.' : 'Create a discount code to run a promotion.'
        }
        emptyAction={
          !hasFilters && (
            <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/coupons/new')}>
              Add Coupon
            </Button>
          )
        }
      />

      {dialog}
    </>
  )
}

export default CouponsView
