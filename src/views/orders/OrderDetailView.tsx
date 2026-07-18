'use client'

// Order detail — header + 2-column card grid (line items/status left,
// customer/shipping cards right), adapted from Theme's ecommerce
// orders/details layout. Same useOrder/useUpdateOrderStatus hooks and
// stage-then-confirm status logic as before — only the layout changed.
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

import CustomTextField from '@core/components/mui/TextField'
import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailSection from '@/components/shared/DetailSection'
import DetailRow from '@/components/shared/DetailRow'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, formatDateTime, humanize } from '@/libs/format'
import { useOrder, useUpdateOrderStatus } from '@/features/orders/hooks/useOrders'
import { ORDER_STATUSES, type OrderStatus } from '@/features/orders/types'

type Props = { id: string }

const OrderDetailView = ({ id }: Props) => {
  const router = useRouter()
  const { success, error } = useToast()
  const { data: order, isLoading, isError, error: fetchError } = useOrder(id)
  const updateStatus = useUpdateOrderStatus()
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null)

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

  if (isLoading || !order) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Order' />
        {isError ? (
          <Alert severity='error'>{(fetchError as Error)?.message || 'Failed to load order.'}</Alert>
        ) : (
          <div className='flex justify-center p-8'>
            <CircularProgress />
          </div>
        )}
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
            <Button variant='tonal' color='secondary' onClick={() => router.push('/orders')}>
              Back
            </Button>
          </div>
        }
      />

      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <DetailSection title='Line items'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align='right'>Qty</TableCell>
                      <TableCell align='right'>Unit price</TableCell>
                      <TableCell align='right'>Line total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar variant='rounded' src={item.productImage} sx={{ width: 36, height: 36 }} />
                            <div className='flex flex-col'>
                              <Typography variant='body2'>{item.productName}</Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {item.volumeMl}ml
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell align='right'>{item.quantity}</TableCell>
                        <TableCell align='right'>{formatCurrency(item.price, order.currency)}</TableCell>
                        <TableCell align='right'>
                          {formatCurrency(item.price * item.quantity, order.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className='flex flex-col gap-1 items-end'>
                  <Typography variant='body2' color='text.secondary'>
                    Subtotal: {formatCurrency(order.subtotal, order.currency)}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Shipping: {formatCurrency(order.shipping, order.currency)}
                  </Typography>
                  <Typography variant='h6'>Total: {formatCurrency(order.total, order.currency)}</Typography>
                </div>
              </DetailSection>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <DetailSection title='Status'>
                <CustomTextField
                  select
                  fullWidth
                  label='Update status'
                  value={order.status}
                  onChange={e => setPendingStatus(e.target.value as OrderStatus)}
                  disabled={updateStatus.isPending}
                  slotProps={{
                    input: {
                      endAdornment: updateStatus.isPending ? <CircularProgress size={18} className='mie-6' /> : null
                    }
                  }}
                >
                  {ORDER_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>
                      {humanize(status)}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </DetailSection>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <DetailSection title='Customer'>
                <DetailRow label='Placed' value={formatDateTime(order.placedAt)} />
                <DetailRow
                  label='Payment / Delivery'
                  value={`${humanize(order.paymentMethod)} · ${humanize(order.deliveryMethod)}`}
                  stacked
                />
                <DetailRow
                  label='Contact'
                  stacked
                  value={
                    <div className='flex flex-col'>
                      <Typography variant='body2'>{order.shippingAddress.fullName}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {order.shippingAddress.phone}
                      </Typography>
                      {order.guestEmail && (
                        <Typography variant='caption' color='text.secondary'>
                          {order.guestEmail} (guest)
                        </Typography>
                      )}
                    </div>
                  }
                />
              </DetailSection>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <DetailSection title='Shipping address'>
                <DetailRow
                  label='Ship to'
                  value={`${order.shippingAddress.address}, ${order.shippingAddress.city}`}
                  stacked
                />
              </DetailSection>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

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
    </>
  )
}

export default OrderDetailView
