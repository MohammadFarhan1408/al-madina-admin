'use client'

// Orders management — server-paginated table with status + date filters and a
// detail dialog that also drives status transitions.
import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import CustomTextField from '@core/components/mui/TextField'
import { formatCurrency, formatDate } from '@/libs/format'
import { useOrders } from '@/features/orders/hooks/useOrders'
import OrderDetailDialog from '@/features/orders/components/OrderDetailDialog'
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/features/orders/types'

const OrdersView = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [active, setActive] = useState<Order | null>(null)

  const { data, isLoading, isFetching, isError, error } = useOrders({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined
  })

  const resetPage = () => setPagination(p => ({ ...p, pageIndex: 0 }))

  const columns = useMemo<ColumnDef<Order, any>[]>(
    () => [
      {
        header: 'Reference',
        accessorKey: 'reference',
        cell: ({ getValue }) => <Typography variant='subtitle2'>{getValue() as string}</Typography>
      },
      {
        header: 'Customer',
        cell: ({ row }) => row.original.shippingAddress?.fullName ?? row.original.guestEmail ?? '—'
      },
      {
        header: 'Items',
        cell: ({ row }) => row.original.items.reduce((sum, i) => sum + i.quantity, 0)
      },
      {
        header: 'Total',
        accessorKey: 'total',
        cell: ({ row }) => formatCurrency(row.original.total, row.original.currency)
      },
      {
        header: 'Placed',
        accessorKey: 'placedAt',
        cell: ({ getValue }) => formatDate(getValue() as string)
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => <StatusChip value={getValue() as string} />
      },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <IconButton size='small' onClick={() => setActive(row.original)}>
            <i className='tabler-eye' />
          </IconButton>
        )
      }
    ],
    []
  )

  return (
    <>
      <PageHeader title='Orders' subtitle='Track and fulfil customer orders' />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load orders.'}</Alert>}

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading || isFetching}
        emptyMessage='No orders match your filters'
        toolbar={
          <Box className='flex flex-wrap items-center gap-4 p-6'>
            <CustomTextField
              select
              value={status}
              onChange={e => {
                setStatus(e.target.value as OrderStatus | '')
                resetPage()
              }}
              className='min-is-[160px]'
              label='Status'
            >
              <MenuItem value=''>All statuses</MenuItem>
              {ORDER_STATUSES.map(s => (
                <MenuItem key={s} value={s} className='capitalize'>
                  {s}
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField
              type='date'
              label='From'
              value={from}
              onChange={e => {
                setFrom(e.target.value)
                resetPage()
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <CustomTextField
              type='date'
              label='To'
              value={to}
              onChange={e => {
                setTo(e.target.value)
                resetPage()
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        }
      />

      <OrderDetailDialog open={!!active} onClose={() => setActive(null)} order={active} />
    </>
  )
}

export default OrdersView
