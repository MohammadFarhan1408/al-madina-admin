'use client'

// Admin dashboard. The KPI cards, charts, status breakdown and top products
// come from GET /admin/dashboard/summary for the selected date range (with the
// previous equal-length period for the trend lines); recent orders come from
// GET /admin/dashboard; the out-of-stock card lists real products. Nothing here
// is estimated or placeholder data.
import { useMemo, useState } from 'react'

import Link from 'next/link'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import ChartCard from '@/components/shared/ChartCard'
import StatCard, { StatCardSkeleton, changeBetween } from '@/components/shared/StatCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import DateRangeControl from '@/features/dashboard/components/DateRangeControl'
import InventoryAlertCard from '@/features/dashboard/components/InventoryAlertCard'
import OrdersStatusChart from '@/features/dashboard/components/OrdersStatusChart'
import RecentOrdersTable from '@/features/dashboard/components/RecentOrdersTable'
import TopProductsList from '@/features/dashboard/components/TopProductsList'
import TrendChart from '@/features/dashboard/components/TrendChart'
import { useDashboard, useDashboardSummary } from '@/features/dashboard/hooks/useDashboard'
import { rangeCaption, resolveRange, type DashboardRange } from '@/features/dashboard/range'
import { formatCurrency } from '@/libs/format'

const DashboardView = () => {
  const [range, setRange] = useState<DashboardRange>({ preset: '30d', from: '', to: '' })
  const resolved = useMemo(() => resolveRange(range), [range])
  const summary = useDashboardSummary(resolved)
  const overview = useDashboard()

  const data = summary.data
  const pending = !data
  const caption = `previous ${rangeCaption(range).replace('last ', '')}`
  const rangeError = range.preset === 'custom' && !resolved ? 'Pick a valid range of up to one year' : undefined
  const hasOrders = !!data && data.totals.orders > 0

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title='Dashboard'
        subtitle={`Store performance — ${rangeCaption(range)}`}
        action={<DateRangeControl range={range} onChange={setRange} error={rangeError} />}
      />

      {summary.isError && (
        <Alert
          severity='error'
          className='mb-4'
          title='Could not load the dashboard'
          action={
            <Button
              size='sm'
              variant='outlined'
              color='error'
              startIcon={<i className='tabler-refresh' />}
              onClick={() => summary.refetch()}
            >
              Try again
            </Button>
          }
        >
          {(summary.error as Error)?.message || 'Failed to load dashboard data.'}
        </Alert>
      )}

      <div className='flex flex-col gap-4 md:gap-5'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {pending ? (
            [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title='Revenue'
                value={formatCurrency(data.totals.revenue)}
                icon='tabler-currency-dirham'
                color='primary'
                trend={{ change: changeBetween(data.totals.revenue, data.previous.revenue), caption }}
              />
              <StatCard
                title='Orders'
                value={data.totals.orders}
                icon='tabler-shopping-cart'
                color='info'
                trend={{ change: changeBetween(data.totals.orders, data.previous.orders), caption }}
              />
              <StatCard
                title='Average order value'
                value={formatCurrency(data.totals.aov)}
                icon='tabler-receipt'
                color='warning'
                trend={{ change: changeBetween(data.totals.aov, data.previous.aov), caption }}
              />
              <StatCard
                title='New customers'
                value={data.totals.newCustomers}
                icon='tabler-user-plus'
                color='success'
                trend={{ change: changeBetween(data.totals.newCustomers, data.previous.newCustomers), caption }}
              />
            </>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5'>
          <ChartCard
            title='Revenue'
            description='Excludes cancelled orders'
            isLoading={pending}
            empty={!hasOrders && { title: 'No orders in this range', description: 'Try a longer date range.' }}
            className='lg:col-span-8'
          >
            {data && <TrendChart data={data.series} dataKey='revenue' label='Revenue' format={formatCurrency} />}
          </ChartCard>
          <ChartCard
            title='Orders by status'
            isLoading={pending}
            empty={!hasOrders && { title: 'No orders in this range' }}
            className='lg:col-span-4'
          >
            {data && <OrdersStatusChart byStatus={data.ordersByStatus} />}
          </ChartCard>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5'>
          <ChartCard
            title='Orders'
            isLoading={pending}
            height={180}
            empty={!hasOrders && { title: 'No orders in this range' }}
          >
            {data && <TrendChart data={data.series} dataKey='orders' label='Orders' height={180} />}
          </ChartCard>
          <ChartCard
            title='New customers'
            isLoading={pending}
            height={180}
            empty={!!data && data.totals.newCustomers === 0 && { title: 'No sign-ups in this range' }}
          >
            {data && <TrendChart data={data.series} dataKey='newCustomers' label='New customers' height={180} />}
          </ChartCard>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5'>
          <Card className='lg:col-span-7'>
            <CardHeader
              title='Top selling products'
              description='By revenue in this range'
              action={
                data?.topProducts.length ? (
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
          <div className='lg:col-span-5'>
            <InventoryAlertCard />
          </div>
        </div>

        <Card>
          <CardHeader
            title='Recent orders'
            action={
              overview.data?.recentOrders.length ? (
                <Link href='/orders'>
                  <Button size='sm' variant='text' endIcon={<i className='tabler-arrow-right' />}>
                    All orders
                  </Button>
                </Link>
              ) : undefined
            }
          />
          <CardBody padding='none'>
            <RecentOrdersTable orders={overview.data?.recentOrders} isLoading={overview.isLoading} />
          </CardBody>
        </Card>
      </div>
    </>
  )
}

export default DashboardView
