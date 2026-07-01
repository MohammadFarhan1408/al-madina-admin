'use client'

// Customers management — server-paginated table, tier filter, detail dialog,
// and deactivate action.
import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import CustomTextField from '@core/components/mui/TextField'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { formatDate } from '@/libs/format'
import { useCustomers, useDeactivateCustomer } from '@/features/customers/hooks/useCustomers'
import CustomerDetailDialog from '@/features/customers/components/CustomerDetailDialog'
import { USER_TIERS, type Customer, type UserTier } from '@/features/customers/types'

const CustomersView = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [tier, setTier] = useState<UserTier | ''>('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [toDeactivate, setToDeactivate] = useState<Customer | null>(null)

  const deactivateMutation = useDeactivateCustomer()
  const { success, error: toastError } = useToast()

  const { data, isLoading, isFetching, isError, error } = useCustomers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    tier: tier || undefined
  })

  const confirmDeactivate = async () => {
    if (!toDeactivate) return

    try {
      await deactivateMutation.mutateAsync(toDeactivate.id)
      success('Customer deactivated')
      setToDeactivate(null)
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to deactivate customer')
    }
  }

  const columns = useMemo<ColumnDef<Customer, any>[]>(
    () => [
      {
        header: 'Customer',
        accessorKey: 'fullName',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar src={row.original.avatar}>{row.original.fullName?.charAt(0)}</Avatar>
            <div className='flex flex-col'>
              <Typography variant='subtitle2'>{row.original.fullName}</Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.original.email}
              </Typography>
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
        cell: ({ getValue }) => <StatusChip value={(getValue() as boolean) ? 'active' : 'inactive'} />
      },
      {
        header: 'Member since',
        accessorKey: 'memberSince',
        cell: ({ row }) => formatDate(row.original.memberSince || row.original.createdAt)
      },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton size='small' onClick={() => setDetailId(row.original.id)}>
              <i className='tabler-eye' />
            </IconButton>
            <IconButton
              size='small'
              color='error'
              disabled={!row.original.isActive}
              onClick={() => setToDeactivate(row.original)}
            >
              <i className='tabler-user-off' />
            </IconButton>
          </div>
        )
      }
    ],
    []
  )

  return (
    <>
      <PageHeader title='Customers' subtitle='Your registered account holders' />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load customers.'}</Alert>}

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading || isFetching}
        emptyMessage='No customers found'
        toolbar={
          <Box className='flex flex-wrap items-center gap-4 p-6'>
            <CustomTextField
              select
              value={tier}
              onChange={e => {
                setTier(e.target.value as UserTier | '')
                setPagination(p => ({ ...p, pageIndex: 0 }))
              }}
              className='min-is-[200px]'
              label='Tier'
            >
              <MenuItem value=''>All tiers</MenuItem>
              {USER_TIERS.map(t => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </CustomTextField>
          </Box>
        }
      />

      <CustomerDetailDialog open={!!detailId} onClose={() => setDetailId(null)} customerId={detailId} />
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
