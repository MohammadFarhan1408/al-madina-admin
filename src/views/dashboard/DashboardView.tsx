'use client'

// Admin dashboard — KPI cards + recent orders + top products, all from
// GET /admin/dashboard (doc §7.12). Reuses shared StatCard / StatusChip.

import Link from 'next/link'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import StatCard, { StatCardSkeleton } from '@/components/shared/StatCard'
import StatusChip from '@/components/shared/StatusChip'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { ORDER_STATUSES } from '@/features/orders/types'
import { formatCurrency, formatDate } from '@/libs/format'

const DashboardView = () => {
  const { data, isLoading, isError, error, refetch } = useDashboard()

  if (isError) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Dashboard' />
        <Alert
          severity='error'
          title='Could not load the dashboard'
          action={
            <Button
              size='sm'
              variant='outlined'
              color='error'
              startIcon={<i className='tabler-refresh' />}
              onClick={() => refetch()}
            >
              Try again
            </Button>
          }
        >
          {(error as Error)?.message || 'Failed to load dashboard data.'}
        </Alert>
      </>
    )
  }

  const pending = isLoading || !data
  const revenue = data?.revenue
  const ordersByStatus = data?.orders?.byStatus

  return (
    <>
      <Breadcrumbs />
      <PageHeader title='Dashboard' subtitle='Store performance at a glance' />

      <div className='flex flex-col gap-4 md:gap-5'>
        {/* auto-fit keeps the KPI row sensible at every width without a chain
            of breakpoint-specific column counts. */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {pending ? (
            [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Today's revenue"
                value={formatCurrency(revenue?.today)}
                icon='tabler-currency-dirham'
                color='primary'
              />
              <StatCard
                title='This week'
                value={formatCurrency(revenue?.week)}
                icon='tabler-calendar-week'
                color='info'
              />
              <StatCard
                title='This month'
                value={formatCurrency(revenue?.month)}
                icon='tabler-chart-line'
                color='success'
              />
              <StatCard title='Customers' value={data.customers ?? 0} icon='tabler-users' color='warning' />
            </>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5'>
          {/* Orders by status */}
          <Card className='md:col-span-5'>
            <CardHeader title='Orders by status' />
            <CardBody className='flex flex-col gap-3'>
              {ORDER_STATUSES.map(status => (
                <div key={status} className='flex items-center justify-between gap-3'>
                  {pending ? (
                    <>
                      <Skeleton className='h-6 w-24 rounded-md' />
                      <Skeleton className='h-4 w-8' />
                    </>
                  ) : (
                    <>
                      <StatusChip value={status} />
                      <span className='text-sm font-semibold tabular-nums text-textPrimary'>
                        {ordersByStatus?.[status] ?? 0}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Top products */}
          <Card className='md:col-span-7'>
            <CardHeader
              title='Top products'
              action={
                !pending && data.topProducts?.length ? (
                  <Link href='/products'>
                    <Button size='sm' variant='text' endIcon={<i className='tabler-arrow-right' />}>
                      All products
                    </Button>
                  </Link>
                ) : undefined
              }
            />
            <CardBody padding={pending || data.topProducts?.length ? 'md' : 'none'}>
              {pending ? (
                <ul className='flex flex-col gap-3'>
                  {[...Array(3)].map((_, i) => (
                    <li key={i} className='flex items-center gap-3'>
                      <Skeleton variant='block' className='size-10' />
                      <div className='flex flex-1 flex-col gap-1.5'>
                        <Skeleton className='w-3/5' />
                        <Skeleton className='h-3 w-1/3' />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : data.topProducts?.length ? (
                <ul className='flex flex-col gap-3'>
                  {data.topProducts.map((product, index) => (
                    <li key={index} className='flex items-center gap-3'>
                      <img
                        src={product.image}
                        alt=''
                        className='size-10 shrink-0 rounded-md border border-border object-cover'
                      />
                      <div className='flex min-w-0 flex-1 flex-col'>
                        <span className='truncate text-sm text-textPrimary'>{product.name}</span>
                        <span className='text-xs text-textMuted'>{product.unitsSold} sold</span>
                      </div>
                      <span className='shrink-0 text-sm font-medium tabular-nums text-textPrimary'>
                        {formatCurrency(product.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  size='sm'
                  icon='tabler-chart-bar-off'
                  title='No sales yet'
                  description='Your best sellers will appear here once orders start coming in.'
                />
              )}
            </CardBody>
          </Card>
        </div>

        {/* Recent orders */}
        <Card>
          <CardHeader
            title='Recent orders'
            action={
              !pending && data.recentOrders?.length ? (
                <Link href='/orders'>
                  <Button size='sm' variant='text' endIcon={<i className='tabler-arrow-right' />}>
                    All orders
                  </Button>
                </Link>
              ) : undefined
            }
          />
          {/* Rows carry their own gutters so each is a full-width hit target. */}
          <CardBody padding='none'>
            {pending ? (
              <ul className='divide-y divide-border'>
                {[...Array(3)].map((_, i) => (
                  <li key={i} className='flex flex-wrap items-center justify-between gap-2 px-5 py-3'>
                    <div className='flex flex-col gap-1.5'>
                      <Skeleton className='w-32' />
                      <Skeleton className='h-3 w-40' />
                    </div>
                    <Skeleton className='w-20' />
                  </li>
                ))}
              </ul>
            ) : data.recentOrders?.length ? (
              <ul className='divide-y divide-border'>
                {data.recentOrders.map(order => (
                  <li key={order.id}>
                    <Link
                      href={`/orders/${order.id}`}
                      className='flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-primary/6'
                    >
                      <div className='flex min-w-0 flex-col'>
                        <span className='truncate text-sm font-medium text-textPrimary'>{order.reference}</span>
                        <span className='truncate text-xs text-textMuted'>
                          {[order.shippingAddress?.fullName, formatDate(order.placedAt)].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                      <div className='flex shrink-0 items-center gap-3'>
                        <StatusChip value={order.status} />
                        <span className='text-sm font-medium tabular-nums text-textPrimary'>
                          {formatCurrency(order.total, order.currency)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                size='sm'
                icon='tabler-shopping-cart-off'
                title='No orders yet'
                description='New customer orders will show up here as they arrive.'
              />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  )
}

export default DashboardView
