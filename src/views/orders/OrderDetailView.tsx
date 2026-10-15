'use client'

// Order detail. Layout, top to bottom:
//   header      — reference, placed date · item count, order + payment status
//   fulfilment  — Processing → Shipped → Delivered stepper + status control
//   main (2/3)  — items with the totals breakdown, then payment & transactions
//   side (1/3)  — customer, delivery, status history
// Status changes are staged in the Select and applied only after the confirm
// dialog, which says exactly who the backend will notify.
import { useState } from 'react'

import Breadcrumbs from '@/components/shared/Breadcrumbs'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import DetailLoading from '@/components/shared/DetailLoading'
import PageHeader from '@/components/shared/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, formatDateTime, humanize } from '@/libs/format'
import OrderCustomerCard from '@/features/orders/components/detail/OrderCustomerCard'
import OrderDeliveryCard from '@/features/orders/components/detail/OrderDeliveryCard'
import OrderDetailSkeleton from '@/features/orders/components/detail/OrderDetailSkeleton'
import OrderFulfilment from '@/features/orders/components/detail/OrderFulfilment'
import OrderHeaderMeta from '@/features/orders/components/detail/OrderHeaderMeta'
import OrderItemsCard from '@/features/orders/components/detail/OrderItemsCard'
import OrderPaymentCard from '@/features/orders/components/detail/OrderPaymentCard'
import { statusChangeEffects } from '@/features/orders/components/detail/orderDetail'
import OrderTimeline from '@/features/orders/components/OrderTimeline'
import {
  useOrder,
  useOrderTransactions,
  useRefundPayment,
  useUpdateOrderStatus
} from '@/features/orders/hooks/useOrders'
import type { OrderStatus } from '@/features/orders/types'

const OrderDetailView = ({ id }: { id: string }) => {
  const { success, error } = useToast()
  const { data: order, isLoading, isError, error: fetchError, refetch } = useOrder(id)
  const { data: transactions } = useOrderTransactions(id)
  const updateStatus = useUpdateOrderStatus()
  const refundPayment = useRefundPayment(id)
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null)
  const [refundTransactionId, setRefundTransactionId] = useState<string | null>(null)

  const applyStatusChange = async () => {
    if (!order || !pendingStatus) return

    try {
      await updateStatus.mutateAsync({ id: order.id, status: pendingStatus })
      success(`Order marked as ${pendingStatus}`)
    } catch (err) {
      error(getErrorMessage(err, 'Failed to update status'))
    } finally {
      setPendingStatus(null)
    }
  }

  const applyRefund = async () => {
    if (!refundTransactionId) return

    try {
      await refundPayment.mutateAsync(refundTransactionId)
      success('Payment refunded')
    } catch (err) {
      error(getErrorMessage(err, 'Failed to refund payment'))
    } finally {
      setRefundTransactionId(null)
    }
  }

  if (isLoading || !order) {
    return (
      <DetailLoading
        title='Order'
        backHref='/orders'
        backLabel='Back to orders'
        skeleton={<OrderDetailSkeleton />}
        isLoading={isLoading}
        isError={isError}
        error={fetchError}
        onRetry={() => refetch()}
        fallbackMessage='Failed to load order.'
      />
    )
  }

  // The API only refunds a settled ('succeeded') transaction, so offer the
  // button for that one specifically — not just whichever attempt is newest.
  const refundable = order.paymentStatus === 'paid' ? transactions?.find(t => t.status === 'succeeded') : undefined

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <Breadcrumbs extra={[{ label: order.reference }]} />
      <PageHeader
        title={`Order ${order.reference}`}
        subtitle={`Placed ${formatDateTime(order.placedAt)} · ${itemCount} item${itemCount === 1 ? '' : 's'} · ${formatCurrency(order.total, order.currency)}`}
        backHref='/orders'
        backLabel='Back to orders'
      >
        <OrderHeaderMeta order={order} />
      </PageHeader>

      <div className='flex flex-col gap-5'>
        <OrderFulfilment order={order} onSelectStatus={setPendingStatus} updating={updateStatus.isPending} />

        <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
          <div className='flex min-w-0 flex-col gap-5'>
            <OrderItemsCard order={order} />
            <OrderPaymentCard
              order={order}
              transactions={transactions}
              refundable={refundable}
              onRefund={setRefundTransactionId}
            />
          </div>

          <div className='flex min-w-0 flex-col gap-5'>
            <OrderCustomerCard order={order} />
            <OrderDeliveryCard order={order} />
            <Card>
              <CardHeader title='Status history' icon='tabler-timeline' />
              <CardBody>
                <OrderTimeline history={order.statusHistory} />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingStatus}
        title={`Mark as ${humanize(pendingStatus ?? '')}?`}
        description={
          pendingStatus
            ? `Order ${order.reference} moves from ${humanize(order.status)} to ${humanize(pendingStatus)}. ${statusChangeEffects(order, pendingStatus)}`
            : undefined
        }
        confirmText='Update status'
        confirmIcon={pendingStatus === 'cancelled' ? 'tabler-ban' : 'tabler-check'}
        confirmColor={pendingStatus === 'cancelled' ? 'error' : 'primary'}
        loading={updateStatus.isPending}
        onConfirm={applyStatusChange}
        onClose={() => setPendingStatus(null)}
      />

      <ConfirmDialog
        open={!!refundTransactionId}
        title='Refund payment'
        description={`Refund ${formatCurrency(refundable?.amount ?? order.total, refundable?.currency ?? order.currency)} for order ${order.reference}? This cannot be undone.`}
        confirmText='Refund'
        confirmIcon='tabler-receipt-refund'
        confirmColor='error'
        loading={refundPayment.isPending}
        onConfirm={applyRefund}
        onClose={() => setRefundTransactionId(null)}
      />
    </>
  )
}

export default OrderDetailView
