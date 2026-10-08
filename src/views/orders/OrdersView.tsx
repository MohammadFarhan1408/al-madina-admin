'use client'

// Orders management — server-paginated table with status + date filters,
// navigates to a dedicated Detail page (also drives status transitions).
// No create/edit routes — orders aren't admin-created.
import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

import MobileRow from '@/components/shared/MobileRow'
import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import ExportButton, { type ExportColumn } from '@/components/shared/ExportButton'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFilterReset } from '@/hooks/useFilterReset'
import { formatCurrency, formatDate } from '@/libs/format'
import OrdersFilterBar from '@/features/orders/components/OrdersFilterBar'
import { ordersApi } from '@/features/orders/api/ordersApi'
import { useBulkUpdateOrderStatus, useOrders } from '@/features/orders/hooks/useOrders'
import type { Order, OrderStatus, PaymentStatus } from '@/features/orders/types'

const EXPORT_COLUMNS: ExportColumn<Order>[] = [
  { header: 'Reference', value: o => o.reference },
  { header: 'Placed', value: o => o.placedAt },
  { header: 'Customer', value: o => o.shippingAddress?.fullName },
  { header: 'Email', value: o => o.guestEmail },
  { header: 'Status', value: o => o.status },
  { header: 'Payment status', value: o => o.paymentStatus },
  { header: 'Payment method', value: o => o.paymentMethod },
  { header: 'Delivery', value: o => o.deliveryMethod },
  { header: 'Items', value: o => o.items.reduce((n, i) => n + i.quantity, 0) },
  { header: 'Subtotal', value: o => o.subtotal },
  { header: 'Shipping', value: o => o.shipping },
  { header: 'Discount', value: o => o.discountAmount },
  { header: 'Total', value: o => o.total },
  { header: 'Currency', value: o => o.currency }
]

const OrdersView = () => {
  const router = useRouter()
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const debouncedSearch = useDebouncedValue(search)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<OrderStatus | null>(null)
  const bulkMutation = useBulkUpdateOrderStatus()
  const { success, error: toastError, toast } = useToast()
  const hasFilters = Boolean(search || paymentStatus || status || from || to)
  const resetOnChange = useFilterReset(setPagination)

  const clearFilters = () => {
    setSearch('')
    setPaymentStatus('')
    setStatus('')
    setFrom('')
    setTo('')
    setPagination(p => ({ ...p, pageIndex: 0 }))
  }

  const filters = {
    q: debouncedSearch || undefined,
    paymentStatus: paymentStatus || undefined,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    sortBy: (sorting[0]?.id as 'reference' | 'placedAt' | 'total' | 'status') || undefined,
    sortOrder: sorting[0] ? (sorting[0].desc ? ('desc' as const) : ('asc' as const)) : undefined
  }

  const { data, isLoading, isFetching, isError, error } = useOrders({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...filters
  })

  const applyBulkStatus = async () => {
    if (!bulkStatus) return

    try {
      const { updated, skipped } = await bulkMutation.mutateAsync({ ids: [...selectedIds], status: bulkStatus })

      // Say exactly why anything was skipped — a silent partial update is worse than none.
      if (skipped.length) {
        const why = skipped
          .slice(0, 3)
          .map(s => `${s.reference ?? 'Order'}: ${s.reason}`)
          .join('; ')

        toast(
          `${updated.length} updated, ${skipped.length} skipped — ${why}${skipped.length > 3 ? '…' : ''}`,
          'warning'
        )
      } else {
        success(`${updated.length} order${updated.length === 1 ? '' : 's'} marked ${bulkStatus}`)
      }

      setSelectedIds(new Set())
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to update the selected orders'))
    } finally {
      setBulkStatus(null)
    }
  }

  const columns = useMemo<ColumnDef<Order, any>[]>(
    () => [
      {
        header: 'Reference',
        accessorKey: 'reference',
        cell: ({ row }) => (
          <button
            type='button'
            className='rounded-xs text-sm font-medium text-textPrimary transition-colors hover:text-primaryInk hover:underline hover:underline-offset-2'
            onClick={() => router.push(`/orders/${row.original.id}`)}
          >
            {row.original.reference}
          </button>
        )
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
        header: 'Payment',
        accessorKey: 'paymentStatus',
        cell: ({ getValue }) => <StatusChip value={getValue() as string} />
      },
      {
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className='flex justify-end'>
            <IconButton
              size='sm'
              aria-label={`View order ${row.original.reference}`}
              onClick={() => router.push(`/orders/${row.original.id}`)}
            >
              <i className='tabler-eye' />
            </IconButton>
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
        title='Orders'
        subtitle='Track and fulfil customer orders'
        action={
          <ExportButton
            filename='orders'
            columns={EXPORT_COLUMNS}
            fetchPage={(page, limit) => ordersApi.list({ ...filters, page, limit })}
          />
        }
      />

      {isError && (
        <Alert severity='error' className='mb-4'>
          {(error as Error)?.message || 'Failed to load orders.'}
        </Alert>
      )}

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        selection={{
          selected: selectedIds,
          onChange: setSelectedIds,
          getId: o => o.id,
          actions: (
            <>
              <Button size='sm' variant='outlined' onClick={() => setBulkStatus('shipped')}>
                Mark shipped
              </Button>
              <Button size='sm' variant='outlined' onClick={() => setBulkStatus('delivered')}>
                Mark delivered
              </Button>
              <Button size='sm' variant='outlined' color='error' onClick={() => setBulkStatus('cancelled')}>
                Cancel orders
              </Button>
            </>
          )
        }}
        mobileCard={order => (
          <MobileRow
            onClick={() => router.push(`/orders/${order.id}`)}
            title={order.reference}
            trailing={<StatusChip value={order.status} />}
            meta={[
              order.shippingAddress?.fullName ?? order.guestEmail ?? '—',
              formatDate(order.placedAt),
              <span key='t' className='font-medium text-textPrimary'>
                {formatCurrency(order.total, order.currency)}
              </span>,
              <StatusChip key='p' value={order.paymentStatus} />
            ]}
          />
        )}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        emptyIcon='tabler-shopping-cart-off'
        emptyMessage={hasFilters ? 'No orders match these filters' : 'No orders yet'}
        emptyDescription={
          hasFilters
            ? 'Try a different search, a wider date range, or clear the filters.'
            : 'Orders placed in the mobile app will appear here.'
        }
        toolbar={
          <OrdersFilterBar
            search={search}
            onSearchChange={resetOnChange(setSearch)}
            paymentStatus={paymentStatus}
            onPaymentStatusChange={resetOnChange(setPaymentStatus)}
            status={status}
            onStatusChange={resetOnChange(setStatus)}
            from={from}
            onFromChange={resetOnChange(setFrom)}
            to={to}
            onToChange={resetOnChange(setTo)}
            hasFilters={hasFilters}
            onClearFilters={clearFilters}
          />
        }
      />
      <ConfirmDialog
        open={bulkStatus !== null}
        title={bulkStatus === 'cancelled' ? 'Cancel orders' : `Mark orders ${bulkStatus}`}
        description={`${selectedIds.size} selected order${selectedIds.size === 1 ? '' : 's'} will be marked ${bulkStatus} and their customers notified. Orders that can't make this move (for example delivered or cancelled ones) are skipped and reported.`}
        confirmText={bulkStatus === 'cancelled' ? 'Cancel orders' : 'Confirm'}
        confirmColor={bulkStatus === 'cancelled' ? 'error' : 'primary'}
        loading={bulkMutation.isPending}
        onConfirm={applyBulkStatus}
        onClose={() => setBulkStatus(null)}
      />
    </>
  )
}

export default OrdersView
