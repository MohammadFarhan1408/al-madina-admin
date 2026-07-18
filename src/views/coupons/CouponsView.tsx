'use client'

// Coupons management — server-paginated table, active filter, navigates to
// dedicated Create/Edit pages (no Detail page — fields fit as list columns),
// delete confirm. Admin-only (no public read endpoint).
import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import CustomTextField from '@core/components/mui/TextField'
import OptionMenu from '@core/components/option-menu'
import { useFilterReset } from '@/hooks/useFilterReset'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, formatDate } from '@/libs/format'
import { useCoupons, useDeleteCoupon } from '@/features/coupons/hooks/useCoupons'
import type { Coupon } from '@/features/coupons/types'

const CouponsView = () => {
  const router = useRouter()
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [isActive, setIsActive] = useState<'' | 'true' | 'false'>('')
  const [toDelete, setToDelete] = useState<Coupon | null>(null)
  const resetOnChange = useFilterReset(setPagination)

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
            <Typography variant='subtitle2'>{row.original.code}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.description}
            </Typography>
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
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Edit',
                  icon: 'tabler-edit',
                  menuItemProps: { onClick: () => router.push(`/coupons/${row.original.id}/edit`) }
                },
                { text: 'Delete', icon: 'tabler-trash', menuItemProps: { onClick: () => setToDelete(row.original) } }
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
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => router.push('/coupons/new')}>
            Add Coupon
          </Button>
        }
      />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load coupons.'}</Alert>}

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        emptyMessage='No coupons found'
        toolbar={
          <Box className='flex flex-wrap items-center gap-4 p-6'>
            <CustomTextField
              select
              value={isActive}
              onChange={e => resetOnChange(setIsActive)(e.target.value as '' | 'true' | 'false')}
              className='min-is-[160px]'
              label='Status'
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='true'>Active</MenuItem>
              <MenuItem value='false'>Inactive</MenuItem>
            </CustomTextField>
          </Box>
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
