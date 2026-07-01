'use client'

// Order detail — line items, shipping snapshot, totals, and status control.
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

import CustomTextField from '@core/components/mui/TextField'
import StatusChip from '@/components/shared/StatusChip'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { formatCurrency, formatDateTime, humanize } from '@/libs/format'
import { useUpdateOrderStatus } from '../hooks/useOrders'
import { ORDER_STATUSES, type Order, type OrderStatus } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  order: Order | null
}

const OrderDetailDialog = ({ open, onClose, order }: Props) => {
  const { success, error } = useToast()
  const updateStatus = useUpdateOrderStatus()

  if (!order) return null

  const handleStatusChange = async (status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      success(`Order marked as ${status}`)
    } catch (err) {
      error(err instanceof ApiError ? err.message : 'Failed to update status')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle className='flex items-center justify-between gap-4'>
        <span>Order {order.reference}</span>
        <StatusChip value={order.status} />
      </DialogTitle>
      <DialogContent className='flex flex-col gap-5'>
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

        <div className='flex flex-col gap-3'>
          {order.items.map((item, idx) => (
            <div key={idx} className='flex items-center gap-3'>
              <Avatar variant='rounded' src={item.productImage} />
              <div className='flex flex-col flex-1'>
                <Typography variant='subtitle2'>{item.productName}</Typography>
                <Typography variant='caption' color='text.secondary'>
                  {item.volumeMl}ml · Qty {item.quantity}
                </Typography>
              </div>
              <Typography variant='subtitle2'>{formatCurrency(item.price * item.quantity, order.currency)}</Typography>
            </div>
          ))}
        </div>

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
          onChange={e => handleStatusChange(e.target.value as OrderStatus)}
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
      </DialogContent>
      <DialogActions>
        <Button variant='tonal' color='secondary' onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default OrderDetailDialog
