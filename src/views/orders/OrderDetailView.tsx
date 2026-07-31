'use client'

// Order detail — header + 2-column card grid (line items/status left,
// customer/shipping cards right), adapted from Theme's ecommerce
// orders/details layout. Same useOrder/useUpdateOrderStatus hooks and
// stage-then-confirm status logic as before — only the layout changed.
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailSection from '@/components/shared/DetailSection'
import DetailRow from '@/components/shared/DetailRow'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import QueryState from '@/components/shared/QueryState'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, formatDateTime, humanize } from '@/libs/format'
import {
  useOrder,
  useOrderTransactions,
  useRefundPayment,
  useUpdateOrderStatus
} from '@/features/orders/hooks/useOrders'
import { ORDER_STATUSES, type OrderStatus } from '@/features/orders/types'

type Props = { id: string }

const OrderDetailView = ({ id }: Props) => {
  const router = useRouter()
  const { success, error } = useToast()
  const { data: order, isLoading, isError, error: fetchError } = useOrder(id)
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

  const latestTransaction = transactions?.[0]

  if (isLoading || !order) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Order' />
        <QueryState isError={isError} error={fetchError} fallbackMessage='Failed to load order.' />
      </>
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: order.reference }]} />
      <PageHeader
        title={`Order ${order.reference}`}
        action={
          <div className='flex items-center gap-3'>
            <StatusChip value={order.status} />
            <StatusChip value={order.paymentStatus} />
            <Button variant='outlined' color='secondary' onClick={() => router.push('/orders')}>
              Back
            </Button>
          </div>
        }
      />

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='flex flex-col gap-6 md:col-span-2'>
          <DetailSection title='Line items'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell align='right'>Qty</TableHeaderCell>
                  <TableHeaderCell align='right'>Unit price</TableHeaderCell>
                  <TableHeaderCell align='right'>Line total</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <img src={item.productImage} alt='' className='size-9 rounded-md object-cover' />
                        <div className='flex flex-col'>
                          <span className='text-sm'>{item.productName}</span>
                          <span className='text-xs text-textSecondary'>{item.volumeMl}ml</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell align='right'>{item.quantity}</TableCell>
                    <TableCell align='right'>{formatCurrency(item.price, order.currency)}</TableCell>
                    <TableCell align='right'>{formatCurrency(item.price * item.quantity, order.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className='flex flex-col items-end gap-1'>
              <span className='text-sm text-textSecondary'>
                Subtotal: {formatCurrency(order.subtotal, order.currency)}
              </span>
              <span className='text-sm text-textSecondary'>
                Shipping: {formatCurrency(order.shipping, order.currency)}
              </span>
              {!!order.discountAmount && (
                <span className='text-sm text-success'>
                  Discount ({order.couponCode}): -{formatCurrency(order.discountAmount, order.currency)}
                </span>
              )}
              <span className='text-base font-semibold'>Total: {formatCurrency(order.total, order.currency)}</span>
            </div>
          </DetailSection>

          <DetailSection title='Payment'>
            <DetailRow label='Status' value={<StatusChip value={order.paymentStatus} />} />
            {latestTransaction && (
              <>
                <DetailRow label='Provider' value={humanize(latestTransaction.provider)} />
                <DetailRow
                  label='Amount'
                  value={formatCurrency(latestTransaction.amount, latestTransaction.currency)}
                />
                {latestTransaction.providerReference && (
                  <DetailRow label='Transaction ref' value={latestTransaction.providerReference} />
                )}
                {latestTransaction.failureReason && (
                  <DetailRow label='Failure reason' value={latestTransaction.failureReason} />
                )}
              </>
            )}

            {transactions && transactions.length > 1 && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>When</TableHeaderCell>
                    <TableHeaderCell>Provider</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map(txn => (
                    <TableRow key={txn.id}>
                      <TableCell>{formatDateTime(txn.createdAt)}</TableCell>
                      <TableCell>{humanize(txn.provider)}</TableCell>
                      <TableCell>
                        <StatusChip value={txn.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {order.paymentStatus === 'paid' && latestTransaction && (
              <Button
                variant='outlined'
                color='error'
                onClick={() => setRefundTransactionId(latestTransaction.id)}
                className='w-fit'
              >
                Refund payment
              </Button>
            )}
          </DetailSection>

          <DetailSection title='Status'>
            <Select
              label='Update status'
              value={order.status}
              onChange={e => setPendingStatus(e.target.value as OrderStatus)}
              disabled={updateStatus.isPending}
              options={ORDER_STATUSES.map(status => ({ label: humanize(status), value: status }))}
            />
          </DetailSection>
        </div>

        <div className='flex flex-col gap-6'>
          <DetailSection title='Customer'>
            <DetailRow label='Placed' value={formatDateTime(order.placedAt)} />
            <DetailRow
              label='Payment method / Delivery'
              value={`${humanize(order.paymentMethod)} · ${humanize(order.deliveryMethod)}`}
              stacked
            />
            <DetailRow
              label='Contact'
              stacked
              value={
                <div className='flex flex-col'>
                  <span className='text-sm'>{order.shippingAddress.fullName}</span>
                  <span className='text-xs text-textSecondary'>{order.shippingAddress.phone}</span>
                  {order.guestEmail && <span className='text-xs text-textSecondary'>{order.guestEmail} (guest)</span>}
                </div>
              }
            />
          </DetailSection>

          <DetailSection title='Shipping address'>
            <DetailRow
              label='Ship to'
              value={`${order.shippingAddress.address}, ${order.shippingAddress.city}`}
              stacked
            />
          </DetailSection>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingStatus}
        title='Update order status'
        description={`Mark order ${order.reference} as "${humanize(pendingStatus ?? '')}"? The customer is not currently notified of status changes.`}
        confirmText='Update status'
        confirmColor={pendingStatus === 'cancelled' ? 'error' : 'primary'}
        loading={updateStatus.isPending}
        onConfirm={applyStatusChange}
        onClose={() => setPendingStatus(null)}
      />

      <ConfirmDialog
        open={!!refundTransactionId}
        title='Refund payment'
        description={`Refund the payment for order ${order.reference}? This cannot be undone.`}
        confirmText='Refund'
        confirmColor='error'
        loading={refundPayment.isPending}
        onConfirm={applyRefund}
        onClose={() => setRefundTransactionId(null)}
      />
    </>
  )
}

export default OrderDetailView
