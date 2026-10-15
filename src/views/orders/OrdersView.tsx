'use client'

// Orders management — server-paginated table with status + date filters,
// navigates to a dedicated Detail page (also drives status transitions).
// No create/edit routes — orders aren't admin-created.
import { useEffect, useMemo, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

import MobileRow from '@/components/shared/MobileRow'
import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import ExportButton, { type ExportColumn } from '@/components/shared/ExportButton'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useListTotals } from '@/hooks/useListTotals'
import { dateRangeParams, hasDateRange, type DateRange } from '@/libs/dateRange'
import { useFilterReset } from '@/hooks/useFilterReset'
import { formatCurrency, formatDate, humanize } from '@/libs/format'
import OrdersFilterBar from '@/features/orders/components/OrdersFilterBar'
import { ordersApi } from '@/features/orders/api/ordersApi'
import { orderKeys, useBulkUpdateOrderStatus, useOrders } from '@/features/orders/hooks/useOrders'
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type Order,
  type OrderStatus,
  type PaymentStatus
} from '@/features/orders/types'

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

// URL params are user-editable (and linked from the dashboard): anything
// outside the known values falls back to "no filter" rather than reaching the
// API as a 422 or filtering while the control shows nothing selected.
const parseStatus = (value: string | null): OrderStatus | '' =>
  (ORDER_STATUSES as readonly string[]).includes(value ?? '') ? (value as OrderStatus) : ''

const parsePaymentStatus = (value: string | null): PaymentStatus | '' =>
  (PAYMENT_STATUSES as readonly string[]).includes(value ?? '') ? (value as PaymentStatus) : ''

const OrdersView = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>(() =>
    parsePaymentStatus(searchParams.get('paymentStatus'))
  )

  const [status, setStatus] = useState<OrderStatus | ''>(() => parseStatus(searchParams.get('status')))
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const { search, setSearch, debouncedSearch } = useDebouncedSearch(setPagination)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<OrderStatus | null>(null)
  const bulkMutation = useBulkUpdateOrderStatus()
  const { success, error: toastError, toast } = useToast()
  const hasFilters = Boolean(search || paymentStatus || status || hasDateRange(dateRange))
  const resetOnChange = useFilterReset(setPagination)

  // Keep the status/payment filters in the URL (as ProductsView does), so a
  // filtered view can be linked to, reloaded and shared.
  useEffect(() => {
    const params = new URLSearchParams()

    if (status) params.set('status', status)
    if (paymentStatus) params.set('paymentStatus', paymentStatus)
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, paymentStatus])

  const clearFilters = () => {
    setSearch('')
    setPaymentStatus('')
    setStatus('')
    setDateRange({})
    setPagination(p => ({ ...p, pageIndex: 0 }))
  }

  // Everything except status: shared by the table and the status-tab counts,
  // so each tab's number is exactly the rows it shows. (The tabs used to show
  // the dashboard's all-time totals, which ignored search, payment and dates.)
  const baseFilters = {
    q: debouncedSearch || undefined,
    paymentStatus: paymentStatus || undefined,
    ...dateRangeParams(dateRange)
  }

  const filters = {
    ...baseFilters,
    status: status || undefined,
    sortBy: (sorting[0]?.id as 'reference' | 'placedAt' | 'total' | 'status') || undefined,
    sortOrder: sorting[0] ? (sorting[0].desc ? ('desc' as const) : ('asc' as const)) : undefined
  }

  const { data, isLoading, isFetching, isError, error, refetch } = useOrders({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...filters
  })

  const statusTotals = useListTotals(
    [...orderKeys.all, 'status-totals', baseFilters],
    ['all', ...ORDER_STATUSES] as const,
    key => ordersApi.list({ ...baseFilters, status: key === 'all' ? undefined : key, page: 1, limit: 1 })
  )

  // 'all' rather than '' so the tab gets a real id (`all-tab`).
  const statusTabs = [
    { value: 'all', label: 'All', count: statusTotals.all },
    ...ORDER_STATUSES.map(s => ({ value: s, label: humanize(s), count: statusTotals[s] }))
  ]

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
        icon='tabler-shopping-cart'
        subtitle='Track and fulfil customer orders'
        action={
          <ExportButton
            filename='orders'
            columns={EXPORT_COLUMNS}
            fetchPage={(page, limit) => ordersApi.list({ ...filters, page, limit })}
          />
        }
      />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        selection={{
          selected: selectedIds,
          onChange: setSelectedIds,
          getId: o => o.id,
          actions: (
            <>
              <Button
                size='sm'
                variant='outlined'
                startIcon={<i className='tabler-truck' />}
                onClick={() => setBulkStatus('shipped')}
              >
                Mark shipped
              </Button>
              <Button
                size='sm'
                variant='outlined'
                startIcon={<i className='tabler-package-export' />}
                onClick={() => setBulkStatus('delivered')}
              >
                Mark delivered
              </Button>
              <Button
                size='sm'
                variant='outlined'
                color='error'
                startIcon={<i className='tabler-ban' />}
                onClick={() => setBulkStatus('cancelled')}
              >
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
        isError={isError}
        errorMessage={(error as Error)?.message}
        onRetry={() => refetch()}
        itemLabel={{ one: 'order', other: 'orders' }}
        tabs={{
          label: 'Order status',
          items: statusTabs,
          value: status || 'all',
          onChange: v => resetOnChange(setStatus)(v === 'all' ? '' : (v as OrderStatus))
        }}
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
            onSearchChange={setSearch}
            paymentStatus={paymentStatus}
            onPaymentStatusChange={resetOnChange(setPaymentStatus)}
            dateRange={dateRange}
            onDateRangeChange={resetOnChange(setDateRange)}
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
        confirmIcon={bulkStatus === 'cancelled' ? 'tabler-ban' : 'tabler-check'}
        confirmColor={bulkStatus === 'cancelled' ? 'error' : 'primary'}
        loading={bulkMutation.isPending}
        onConfirm={applyBulkStatus}
        onClose={() => setBulkStatus(null)}
      />
    </>
  )
}

export default OrdersView
