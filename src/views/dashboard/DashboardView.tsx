'use client'

// Admin dashboard — KPI cards + charts + tables, all from GET /admin/dashboard
// (doc §7.12). Every widget is backed by a real field on DashboardData; there
// is no historical time-series or trend-% data in the backend response, so
// there are no sparklines/trend arrows here — see AGENTS.md dashboard notes.

import Link from 'next/link'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import StatCard, { StatCardSkeleton } from '@/components/shared/StatCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import InventoryAlertCard from '@/features/dashboard/components/InventoryAlertCard'
import OrdersStatusChart from '@/features/dashboard/components/OrdersStatusChart'
import RecentOrdersTable from '@/features/dashboard/components/RecentOrdersTable'
import RevenueChart from '@/features/dashboard/components/RevenueChart'
import TopProductsList from '@/features/dashboard/components/TopProductsList'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { formatCurrency } from '@/libs/format'

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
  const outOfStock = data?.products.outOfStock ?? 0
  const showInventoryAlert = pending || outOfStock > 0

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
                title='Total revenue'
                value={formatCurrency(data.revenue.month)}
                subtitle='This month'
                icon='tabler-currency-dirham'
                color='primary'
              />
              <StatCard
                title='Orders'
                value={data.orders.month}
                subtitle='This month'
                icon='tabler-shopping-cart'
                color='info'
              />
              <StatCard title='Customers' value={data.customers} icon='tabler-users' color='success' />
              <StatCard
                title='Products'
                value={data.products.total}
                subtitle={outOfStock > 0 ? `${outOfStock} out of stock` : undefined}
                icon='tabler-package'
                color='warning'
              />
            </>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5'>
          <Card className={showInventoryAlert ? 'md:col-span-7' : 'md:col-span-12'}>
            <CardHeader title='Revenue overview' description='Today, this week and this month' />
            <CardBody>
              <RevenueChart revenue={data?.revenue} isLoading={pending} />
            </CardBody>
          </Card>

          {showInventoryAlert && (
            <div className='md:col-span-5'>
              <InventoryAlertCard outOfStock={outOfStock} isLoading={pending} />
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5'>
          <Card className='md:col-span-5'>
            <CardHeader title='Orders by status' />
            <CardBody>
              <OrdersStatusChart byStatus={data?.orders.byStatus} isLoading={pending} />
            </CardBody>
          </Card>

          <Card className='md:col-span-7'>
            <CardHeader
              title='Top selling products'
              action={
                !pending && data.topProducts.length ? (
                  <Link href='/products'>
                    <Button size='sm' variant='text' endIcon={<i className='tabler-arrow-right' />}>
                      All products
                    </Button>
                  </Link>
                ) : undefined
              }
            />
            <CardBody>
              <TopProductsList products={data?.topProducts} isLoading={pending} />
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader
            title='Recent orders'
            action={
              !pending && data.recentOrders.length ? (
                <Link href='/orders'>
                  <Button size='sm' variant='text' endIcon={<i className='tabler-arrow-right' />}>
                    All orders
                  </Button>
                </Link>
              ) : undefined
            }
          />
          <CardBody padding='none'>
            <RecentOrdersTable orders={data?.recentOrders} isLoading={pending} />
          </CardBody>
        </Card>
      </div>
    </>
  )
}

export default DashboardView
