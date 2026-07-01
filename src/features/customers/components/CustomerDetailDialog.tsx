'use client'

// Customer detail — profile, tier control, and recent orders (doc §7.12).
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

import CustomTextField from '@core/components/mui/TextField'
import StatusChip from '@/components/shared/StatusChip'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { formatCurrency, formatDate } from '@/libs/format'
import { useCustomer, useUpdateCustomerTier } from '../hooks/useCustomers'
import { USER_TIERS, type UserTier } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  customerId: string | null
}

const CustomerDetailDialog = ({ open, onClose, customerId }: Props) => {
  const { success, error } = useToast()
  const { data, isLoading } = useCustomer(open ? customerId ?? undefined : undefined)
  const updateTier = useUpdateCustomerTier()

  const handleTierChange = async (tier: UserTier) => {
    if (!customerId) return

    try {
      await updateTier.mutateAsync({ id: customerId, tier })
      success('Tier updated')
    } catch (err) {
      error(err instanceof ApiError ? err.message : 'Failed to update tier')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Customer</DialogTitle>
      <DialogContent className='flex flex-col gap-5'>
        {isLoading || !data ? (
          <div className='flex justify-center p-8'>
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className='flex items-center gap-4'>
              <Avatar src={data.user.avatar} sx={{ width: 56, height: 56 }} />
              <div className='flex flex-col'>
                <Typography variant='h6'>{data.user.fullName}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {data.user.email}
                </Typography>
                <div className='flex items-center gap-2 mbs-1'>
                  <StatusChip value={data.user.isActive ? 'active' : 'inactive'} />
                  <StatusChip value={data.user.tier} />
                </div>
              </div>
            </div>

            <CustomTextField
              select
              fullWidth
              label='Loyalty tier'
              value={data.user.tier}
              onChange={e => handleTierChange(e.target.value as UserTier)}
              disabled={updateTier.isPending}
            >
              {USER_TIERS.map(tier => (
                <MenuItem key={tier} value={tier}>
                  {tier}
                </MenuItem>
              ))}
            </CustomTextField>

            <Divider textAlign='left'>
              <Typography variant='body2' color='text.secondary'>
                Recent orders
              </Typography>
            </Divider>

            {data.recentOrders.length ? (
              data.recentOrders.map(order => (
                <div key={order.id} className='flex items-center justify-between gap-2'>
                  <div className='flex flex-col'>
                    <Typography variant='subtitle2'>{order.reference}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {formatDate(order.placedAt)}
                    </Typography>
                  </div>
                  <div className='flex items-center gap-3'>
                    <StatusChip value={order.status} />
                    <Typography variant='subtitle2'>{formatCurrency(order.total, order.currency)}</Typography>
                  </div>
                </div>
              ))
            ) : (
              <Typography color='text.secondary'>No orders yet.</Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant='tonal' color='secondary' onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CustomerDetailDialog
