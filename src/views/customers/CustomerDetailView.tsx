'use client'

// Customer detail — left profile card (avatar, status, tier control) + right
// tabbed content (Overview/Addresses/Cart), adapted from Theme's ecommerce
// customers/details layout. Same useCustomer/useUpdateCustomerTier hooks and
// tier stage-then-confirm logic as before — only the layout changed.
import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailSection from '@/components/shared/DetailSection'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ZoomableImage from '@/components/shared/ZoomableImage'
import QueryState from '@/components/shared/QueryState'
import Button from '@/components/ui/Button'
import Card, { CardBody } from '@/components/ui/Card'
import Select from '@/components/ui/form/Select'
import Tabs, { TabPanel } from '@/components/ui/Tabs'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, formatDate } from '@/libs/format'
import { useCustomer, useReactivateCustomer, useUpdateCustomerTier } from '@/features/customers/hooks/useCustomers'
import { USER_TIERS, type UserTier } from '@/features/customers/types'

type Props = { id: string }

const CustomerDetailView = ({ id }: Props) => {
  const router = useRouter()
  const { success, error } = useToast()
  const { data, isLoading, isError, error: fetchError, refetch } = useCustomer(id)
  const updateTier = useUpdateCustomerTier()
  const [pendingTier, setPendingTier] = useState<UserTier | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const reactivate = useReactivateCustomer()

  const reactivateNow = async () => {
    try {
      await reactivate.mutateAsync(id)
      success('Customer reactivated')
    } catch (err) {
      error(getErrorMessage(err, 'Failed to reactivate customer'))
    }
  }

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
        <QueryState
          isError={isError}
          error={fetchError}
          onRetry={() => refetch()}
          fallbackMessage='Failed to load customer.'
        />
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
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='outlined' color='secondary' onClick={() => router.push('/customers')}>
              Back
            </Button>
            {!data.user.isActive && (
              <Button
                variant='outlined'
                startIcon={<i className='tabler-user-check' />}
                loading={reactivate.isPending}
                onClick={reactivateNow}
              >
                Reactivate
              </Button>
            )}
          </div>
        }
      />

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div>
          <Card>
            <CardBody className='flex flex-col items-center gap-4 pt-12'>
              {data.user.avatar ? (
                <ZoomableImage src={data.user.avatar} alt={data.user.fullName}>
                  <img src={data.user.avatar} alt='' className='size-25 rounded-full object-cover' />
                </ZoomableImage>
              ) : (
                <span
                  aria-hidden
                  className='flex size-25 items-center justify-center rounded-full bg-secondary/15 text-3xl font-medium text-secondaryDark'
                >
                  {data.user.fullName?.charAt(0).toUpperCase()}
                </span>
              )}
              <div className='flex flex-col items-center gap-2 text-center'>
                <h2 className='text-xl font-semibold'>{data.user.fullName}</h2>
                <p className='text-textSecondary'>{data.user.email}</p>
                <div className='flex items-center gap-2'>
                  <StatusChip value={data.user.isActive ? 'active' : 'inactive'} />
                  <StatusChip value={data.user.tier} />
                </div>
              </div>
              <dl className='grid w-full grid-cols-2 gap-3 text-center'>
                <div className='rounded-md bg-surfaceSunken/50 px-3 py-2'>
                  <dd className='text-lg font-semibold tabular-nums'>{data.stats.orderCount}</dd>
                  <dt className='text-xs text-textMuted'>Orders</dt>
                </div>
                <div className='rounded-md bg-surfaceSunken/50 px-3 py-2'>
                  <dd className='text-lg font-semibold tabular-nums'>{formatCurrency(data.stats.totalSpent)}</dd>
                  <dt className='text-xs text-textMuted'>Total spent</dt>
                </div>
              </dl>
              <hr className='w-full border-border' />
              <Select
                containerClassName='w-full'
                label='Loyalty tier'
                value={data.user.tier}
                onChange={e => {
                  const next = e.target.value as UserTier

                  if (next !== data.user.tier) setPendingTier(next)
                }}
                disabled={updateTier.isPending}
                options={USER_TIERS.map(tier => ({ label: tier, value: tier }))}
              />
            </CardBody>
          </Card>
        </div>

        <div className='md:col-span-2'>
          <Tabs
            className='mb-4'
            value={activeTab}
            onChange={setActiveTab}
            items={[
              { value: 'overview', label: 'Overview' },
              { value: 'addresses', label: 'Addresses' },
              { value: 'cart', label: 'Cart' }
            ]}
          />

          <TabPanel active={activeTab === 'overview'} className='p-0'>
            <DetailSection title='Recent orders'>
              {data.recentOrders.length ? (
                data.recentOrders.map(order => (
                  <div key={order.id} className='flex items-center justify-between gap-2'>
                    <div className='flex flex-col'>
                      <Link
                        href={`/orders/${order.id}`}
                        className='text-sm font-medium hover:text-primaryInk hover:underline'
                      >
                        {order.reference}
                      </Link>
                      <span className='text-xs text-textSecondary'>{formatDate(order.placedAt)}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <StatusChip value={order.status} />
                      <span className='text-sm font-medium'>{formatCurrency(order.total, order.currency)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-textSecondary'>No orders yet.</p>
              )}
            </DetailSection>
          </TabPanel>

          <TabPanel active={activeTab === 'addresses'} className='p-0'>
            <DetailSection title='Saved addresses'>
              {data.addresses.length ? (
                data.addresses.map(addr => (
                  <div key={addr.id} className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>{addr.fullName}</span>
                      {addr.isDefault && <StatusChip value='default' color='primary' />}
                      {addr.label && <span className='text-xs text-textSecondary'>({addr.label})</span>}
                    </div>
                    <span className='text-sm text-textSecondary'>{addr.phone}</span>
                    <span className='text-sm text-textSecondary'>
                      {[addr.addressLine, addr.city, addr.state, addr.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                ))
              ) : (
                <p className='text-textSecondary'>No saved addresses.</p>
              )}
            </DetailSection>
          </TabPanel>

          <TabPanel active={activeTab === 'cart'} className='p-0'>
            <DetailSection title='Current cart'>
              {data.cart.length ? (
                data.cart.map((item, idx) => {
                  const product = typeof item.productId === 'string' ? null : item.productId

                  return (
                    <div key={idx} className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-3'>
                        {product && (
                          <ZoomableImage src={product.images?.[0]} alt={product.name}>
                            <img src={product.images?.[0]} alt='' className='size-10 rounded-md object-cover' />
                          </ZoomableImage>
                        )}
                        <span className='text-sm'>{product?.name ?? 'Unknown product'}</span>
                      </div>
                      <span className='text-xs text-textSecondary'>
                        Qty {item.quantity} · {item.volumeMl}ml
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className='text-textSecondary'>Cart is empty.</p>
              )}
            </DetailSection>
          </TabPanel>
        </div>
      </div>

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
