'use client'

// Order detail — line items, shipping snapshot, totals, and status control.
// Fetches live by id (like CustomerDetailDialog) instead of taking a row
// snapshot, so a status change is reflected immediately instead of showing
// stale data until the dialog is closed and reopened.
import { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

import CustomTextField from '@core/components/mui/TextField'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, formatDateTime, humanize } from '@/libs/format'
import { useOrder, useUpdateOrderStatus } from '../hooks/useOrders'
import { ORDER_STATUSES, type OrderStatus } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  orderId: string | null
}

const OrderDetailDialog = ({ open, onClose, orderId }: Props) => {
  const { success, error } = useToast()
  const { data: order, isLoading } = useOrder(open ? (orderId ?? undefined) : undefined)
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle className='flex items-center justify-between gap-4'>
        <span>Order {order?.reference ?? ''}</span>
        {order && <StatusChip value={order.status} />}
      </DialogTitle>
      <DialogContent className='flex flex-col gap-5'>
        {isLoading || !order ? (
          <div className='flex justify-center p-8'>
            <CircularProgress size={28} />
          </div>
        ) : (
          <>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Placed
                </Typography>
                <Typography>{formatDateTime(order.placedAt)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Payment / Delivery
                </Typography>
                <Typography>
                  {humanize(order.paymentMethod)} · {humanize(order.deliveryMethod)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Customer
                </Typography>
                <Typography>{order.shippingAddress.fullName}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {order.shippingAddress.phone}
                </Typography>
                {order.guestEmail && (
                  <Typography variant='body2' color='text.secondary'>
                    {order.guestEmail} (guest)
                  </Typography>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Ship to
                </Typography>
                <Typography>
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                </Typography>
              </Grid>
            </Grid>

            <Divider />

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
                    <TableCell align='right'>{formatCurrency(item.price * item.quantity, order.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider />

            <div className='flex flex-col gap-1 items-end'>
              <Typography variant='body2' color='text.secondary'>
                Subtotal: {formatCurrency(order.subtotal, order.currency)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Shipping: {formatCurrency(order.shipping, order.currency)}
              </Typography>
              <Typography variant='h6'>Total: {formatCurrency(order.total, order.currency)}</Typography>
            </div>

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
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant='tonal' color='secondary' onClick={onClose}>
          Close
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={!!pendingStatus}
        title='Update order status'
        description={`Mark order ${order?.reference ?? ''} as "${humanize(pendingStatus ?? '')}"? The customer is not currently notified of status changes.`}
        confirmText='Update status'
        confirmColor={pendingStatus === 'cancelled' ? 'error' : 'primary'}
        loading={updateStatus.isPending}
        onConfirm={applyStatusChange}
        onClose={() => setPendingStatus(null)}
      />
    </Dialog>
  )
}

export default OrderDetailDialog
