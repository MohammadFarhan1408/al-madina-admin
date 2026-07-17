'use client'

// Orders management — server-paginated table with status + date filters and a
// detail dialog that also drives status transitions.
import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import CustomTextField from '@core/components/mui/TextField'
import { useFilterReset } from '@/hooks/useFilterReset'
import { formatCurrency, formatDate, humanize } from '@/libs/format'
import { useOrders } from '@/features/orders/hooks/useOrders'
import OrderDetailDialog from '@/features/orders/components/OrderDetailDialog'
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/features/orders/types'

const OrdersView = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const resetOnChange = useFilterReset(setPagination)

  const { data, isLoading, isFetching, isError, error } = useOrders({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    sortBy: (sorting[0]?.id as 'reference' | 'placedAt' | 'total' | 'status') || undefined,
    sortOrder: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined
  })

  const columns = useMemo<ColumnDef<Order, any>[]>(
    () => [
      {
        header: 'Reference',
        accessorKey: 'reference',
        cell: ({ getValue }) => <Typography variant='subtitle2'>{getValue() as string}</Typography>
      },
      {
        header: 'Customer',
        enableSorting: false,
        cell: ({ row }) => row.original.shippingAddress?.fullName ?? row.original.guestEmail ?? '—'
      },
      {
        header: 'Items',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => row.original.items.reduce((sum, i) => sum + i.quantity, 0)
      },
      {
        header: 'Total',
        accessorKey: 'total',
        meta: { align: 'right' },
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
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className='flex justify-end'>
            <IconButton size='small' aria-label={`View order ${row.original.reference}`} onClick={() => setActiveId(row.original.id)}>
              <i className='tabler-eye' />
            </IconButton>
          </div>
        )
      }
    ],
    []
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader title='Orders' subtitle='Track and fulfil customer orders' />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load orders.'}</Alert>}

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
        emptyMessage='No orders match your filters'
        toolbar={
          <Box className='flex flex-wrap items-center gap-4 p-6'>
            <CustomTextField
              select
              value={status}
              onChange={e => resetOnChange(setStatus)(e.target.value as OrderStatus | '')}
              className='min-is-[160px]'
              label='Status'
            >
              <MenuItem value=''>All statuses</MenuItem>
              {ORDER_STATUSES.map(s => (
                <MenuItem key={s} value={s}>
                  {humanize(s)}
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField
              type='date'
              label='From'
              value={from}
              onChange={e => resetOnChange(setFrom)(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <CustomTextField
              type='date'
              label='To'
              value={to}
              onChange={e => resetOnChange(setTo)(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        }
      />

      <OrderDetailDialog open={!!activeId} onClose={() => setActiveId(null)} orderId={activeId} />
    </>
  )
}

export default OrdersView
