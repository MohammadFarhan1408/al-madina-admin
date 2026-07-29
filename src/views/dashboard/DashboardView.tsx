'use client'

// Admin dashboard — KPI cards + recent orders + top products, all from
// GET /admin/dashboard (doc §7.12). Reuses shared StatCard / StatusChip.

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import StatCard from '@/components/shared/StatCard'
import StatusChip from '@/components/shared/StatusChip'
import Alert from '@/components/ui/Alert'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { ORDER_STATUSES } from '@/features/orders/types'
import { formatCurrency, formatDate } from '@/libs/format'

const Shimmer = ({ className }: { className?: string }) => (
  <span className={`block animate-pulse rounded bg-textDisabled/20 ${className ?? ''}`} />
)

const KpiSkeleton = () => (
  <Card>
    <CardBody className='flex items-center gap-4'>
      <Shimmer className='size-11 rounded-md' />
      <div className='flex flex-col gap-1'>
        <Shimmer className='h-7 w-20' />
        <Shimmer className='h-4 w-25' />
      </div>
    </CardBody>
  </Card>
)

const DashboardView = () => {
  const { data, isLoading, isError, error } = useDashboard()

  if (isError) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Dashboard' />
        <Alert severity='error'>{(error as Error)?.message || 'Failed to load dashboard data.'}</Alert>
      </>
    )
  }

  const revenue = data?.revenue
  const ordersByStatus = data?.orders?.byStatus

  return (
    <>
      <Breadcrumbs />
      <PageHeader title='Dashboard' subtitle='Store performance at a glance' />

      <div className='flex flex-col gap-6'>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4'>
          {isLoading || !data ? (
            [...Array(4)].map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Today's Revenue"
                value={formatCurrency(revenue?.today)}
                icon='tabler-currency-dirham'
                color='primary'
              />
              <StatCard title='This Week' value={formatCurrency(revenue?.week)} icon='tabler-calendar-week' color='info' />
              <StatCard
                title='This Month'
                value={formatCurrency(revenue?.month)}
                icon='tabler-chart-line'
                color='success'
              />
              <StatCard title='Customers' value={data.customers ?? 0} icon='tabler-users' color='warning' />
            </>
          )}
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
          {/* Orders by status */}
          <Card className='md:col-span-5'>
            <CardHeader>
              <h2 className='text-base font-semibold text-textPrimary'>Orders by Status</h2>
            </CardHeader>
            <CardBody className='flex flex-col gap-4'>
              {isLoading || !data
                ? ORDER_STATUSES.map(status => (
                    <div key={status} className='flex items-center justify-between'>
                      <Shimmer className='h-6 w-24 rounded-full' />
                      <Shimmer className='h-4 w-8' />
                    </div>
                  ))
                : ORDER_STATUSES.map(status => (
                    <div key={status} className='flex items-center justify-between'>
                      <StatusChip value={status} />
                      <span className='text-base font-semibold'>{ordersByStatus?.[status] ?? 0}</span>
                    </div>
                  ))}
            </CardBody>
          </Card>

          {/* Top products */}
          <Card className='md:col-span-7'>
            <CardHeader>
              <h2 className='text-base font-semibold text-textPrimary'>Top Products</h2>
            </CardHeader>
            <CardBody>
              {isLoading || !data ? (
                <ul className='flex flex-col gap-3'>
                  {[...Array(3)].map((_, i) => (
                    <li key={i} className='flex items-center gap-3'>
                      <Shimmer className='size-10 rounded-md' />
                      <div className='flex flex-1 flex-col gap-1'>
                        <Shimmer className='h-4 w-3/5' />
                        <Shimmer className='h-3 w-1/3' />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : data.topProducts?.length ? (
                <ul className='flex flex-col gap-3'>
                  {data.topProducts.map((product, index) => (
                    <li key={index} className='flex items-center gap-3'>
                      <img src={product.image} alt='' className='size-10 shrink-0 rounded-md object-cover' />
                      <div className='flex flex-1 flex-col'>
                        <span className='text-sm'>{product.name}</span>
                        <span className='text-xs text-textSecondary'>{product.unitsSold} sold</span>
                      </div>
                      <span className='text-sm font-medium'>{formatCurrency(product.revenue)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-textSecondary'>No sales data yet.</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Recent orders */}
        <Card>
          <CardHeader>
            <h2 className='text-base font-semibold text-textPrimary'>Recent Orders</h2>
          </CardHeader>
          <CardBody>
            {isLoading || !data ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className='flex flex-wrap items-center justify-between gap-2 py-3'>
                  <Shimmer className='h-4 w-30' />
                  <Shimmer className='h-4 w-20' />
                </div>
              ))
            ) : data.recentOrders?.length ? (
              <ul className='divide-y divide-secondary/15'>
                {data.recentOrders.map(order => (
                  <li key={order.id} className='flex flex-wrap items-center justify-between gap-2 py-3'>
                    <div className='flex flex-col'>
                      <span className='text-sm font-medium'>{order.reference}</span>
                      <span className='text-xs text-textSecondary'>
                        {order.shippingAddress?.fullName} · {formatDate(order.placedAt)}
                      </span>
                    </div>
                    <div className='flex items-center gap-4'>
                      <StatusChip value={order.status} />
                      <span className='text-sm font-medium'>{formatCurrency(order.total, order.currency)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-textSecondary'>No recent orders.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  )
}

export default DashboardView
