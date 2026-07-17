'use client'

// Customer detail — profile, tier control, and recent orders (doc §7.12).
import { useState } from 'react'

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
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ZoomableImage from '@/components/shared/ZoomableImage'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
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
  const { data, isLoading } = useCustomer(open ? (customerId ?? undefined) : undefined)
  const updateTier = useUpdateCustomerTier()
  const [pendingTier, setPendingTier] = useState<UserTier | null>(null)

  const applyTierChange = async () => {
    if (!customerId || !pendingTier) return

    try {
      await updateTier.mutateAsync({ id: customerId, tier: pendingTier })
      success('Tier updated')
    } catch (err) {
      error(getErrorMessage(err, 'Failed to update tier'))
    } finally {
      setPendingTier(null)
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
              <ZoomableImage src={data.user.avatar} alt={data.user.fullName}>
                <Avatar src={data.user.avatar} sx={{ width: 56, height: 56 }} />
              </ZoomableImage>
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
              onChange={e => {
                const next = e.target.value as UserTier

                if (next !== data.user.tier) setPendingTier(next)
              }}
              disabled={updateTier.isPending}
              slotProps={{
                input: {
                  endAdornment: updateTier.isPending ? <CircularProgress size={18} className='mie-6' /> : null
                }
              }}
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

            <Divider textAlign='left'>
              <Typography variant='body2' color='text.secondary'>
                Saved addresses
              </Typography>
            </Divider>

            {data.addresses.length ? (
              data.addresses.map(addr => (
                <div key={addr.id} className='flex flex-col gap-0.5'>
                  <div className='flex items-center gap-2'>
                    <Typography variant='subtitle2'>{addr.fullName}</Typography>
                    {addr.isDefault && <StatusChip value='default' color='primary' />}
                    {addr.label && (
                      <Typography variant='caption' color='text.secondary'>
                        ({addr.label})
                      </Typography>
                    )}
                  </div>
                  <Typography variant='body2' color='text.secondary'>
                    {addr.phone}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {[addr.addressLine, addr.city, addr.state, addr.country].filter(Boolean).join(', ')}
                  </Typography>
                </div>
              ))
            ) : (
              <Typography color='text.secondary'>No saved addresses.</Typography>
            )}

            <Divider textAlign='left'>
              <Typography variant='body2' color='text.secondary'>
                Current cart
              </Typography>
            </Divider>

            {data.cart.length ? (
              data.cart.map((item, idx) => {
                const product = typeof item.productId === 'string' ? null : item.productId

                return (
                  <div key={idx} className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-3'>
                      {product && (
                        <ZoomableImage src={product.images?.[0]} alt={product.name}>
                          <Avatar variant='rounded' src={product.images?.[0]} sx={{ width: 40, height: 40 }} />
                        </ZoomableImage>
                      )}
                      <Typography variant='body2'>{product?.name ?? 'Unknown product'}</Typography>
                    </div>
                    <Typography variant='caption' color='text.secondary'>
                      Qty {item.quantity} · {item.volumeMl}ml
                    </Typography>
                  </div>
                )
              })
            ) : (
              <Typography color='text.secondary'>Cart is empty.</Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant='tonal' color='secondary' onClick={onClose}>
          Close
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={!!pendingTier}
        title='Change loyalty tier'
        description={`Move ${data?.user.fullName ?? 'this customer'} to "${pendingTier ?? ''}"?`}
        confirmText='Change tier'
        confirmColor='primary'
        loading={updateTier.isPending}
        onConfirm={applyTierChange}
        onClose={() => setPendingTier(null)}
      />
    </Dialog>
  )
}

export default CustomerDetailDialog
