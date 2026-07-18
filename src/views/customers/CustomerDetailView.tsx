'use client'

// Customer detail — left profile card (avatar, status, tier control) + right
// tabbed content (Overview/Addresses/Cart), adapted from Theme's ecommerce
// customers/details layout. Same useCustomer/useUpdateCustomerTier hooks and
// tier stage-then-confirm logic as before — only the layout changed.
import { useState, type SyntheticEvent } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Tab from '@mui/material/Tab'

import CustomTextField from '@core/components/mui/TextField'
import CustomTabList from '@core/components/mui/TabList'
import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailSection from '@/components/shared/DetailSection'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ZoomableImage from '@/components/shared/ZoomableImage'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, formatDate } from '@/libs/format'
import { useCustomer, useUpdateCustomerTier } from '@/features/customers/hooks/useCustomers'
import { USER_TIERS, type UserTier } from '@/features/customers/types'

type Props = { id: string }

const CustomerDetailView = ({ id }: Props) => {
  const router = useRouter()
  const { success, error } = useToast()
  const { data, isLoading, isError, error: fetchError } = useCustomer(id)
  const updateTier = useUpdateCustomerTier()
  const [pendingTier, setPendingTier] = useState<UserTier | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const applyTierChange = async () => {
    if (!pendingTier) return

    try {
      await updateTier.mutateAsync({ id, tier: pendingTier })
      success('Tier updated')
    } catch (err) {
      error(getErrorMessage(err, 'Failed to update tier'))
    } finally {
      setPendingTier(null)
    }
  }

  if (isLoading || !data) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Customer' />
        {isError ? (
          <Alert severity='error'>{(fetchError as Error)?.message || 'Failed to load customer.'}</Alert>
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
      <Breadcrumbs extra={[{ label: data.user.fullName }]} />
      <PageHeader
        title={data.user.fullName}
        subtitle={data.user.email}
        action={
          <Button variant='tonal' color='secondary' onClick={() => router.push('/customers')}>
            Back
          </Button>
        }
      />

      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent className='flex flex-col items-center gap-4 pbs-12'>
              <ZoomableImage src={data.user.avatar} alt={data.user.fullName}>
                <Avatar src={data.user.avatar} sx={{ width: 100, height: 100 }} />
              </ZoomableImage>
              <div className='flex flex-col items-center text-center gap-2'>
                <Typography variant='h5'>{data.user.fullName}</Typography>
                <Typography color='text.secondary'>{data.user.email}</Typography>
                <div className='flex items-center gap-2'>
                  <StatusChip value={data.user.isActive ? 'active' : 'inactive'} />
                  <StatusChip value={data.user.tier} />
                </div>
              </div>
              <Divider className='is-full' />
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
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <TabContext value={activeTab}>
            <CustomTabList onChange={(_: SyntheticEvent, value: string) => setActiveTab(value)} className='mbe-4'>
              <Tab label='Overview' value='overview' />
              <Tab label='Addresses' value='addresses' />
              <Tab label='Cart' value='cart' />
            </CustomTabList>

            <TabPanel value='overview' className='p-0'>
              <DetailSection title='Recent orders'>
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
              </DetailSection>
            </TabPanel>

            <TabPanel value='addresses' className='p-0'>
              <DetailSection title='Saved addresses'>
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
              </DetailSection>
            </TabPanel>

            <TabPanel value='cart' className='p-0'>
              <DetailSection title='Current cart'>
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
              </DetailSection>
            </TabPanel>
          </TabContext>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={!!pendingTier}
        title='Change loyalty tier'
        description={`Move ${data.user.fullName} to "${pendingTier ?? ''}"?`}
        confirmText='Change tier'
        confirmColor='primary'
        loading={updateTier.isPending}
        onConfirm={applyTierChange}
        onClose={() => setPendingTier(null)}
      />
    </>
  )
}

export default CustomerDetailView
