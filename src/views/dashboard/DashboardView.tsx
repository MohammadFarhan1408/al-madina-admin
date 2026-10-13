'use client'

// Admin dashboard, ordered for a manager's daily check:
//   1. Needs attention — current counts that need action (orders to fulfil,
//      payments failed/pending, out of stock), each linking to the matching
//      filtered list. Independent of the date range.
//   2. Performance — KPIs with the change vs the previous equal-length period,
//      revenue/orders over time, status mix and best sellers, all from
//      GET /admin/dashboard/summary for the selected range.
//   3. Latest orders — from GET /admin/dashboard (newest 10, any date).
// Each section loads, empties and fails on its own. No estimated or
// placeholder data; labels follow what admin.repository actually counts.
import { useMemo, useState } from 'react'

import Link from 'next/link'

import Breadcrumbs from '@/components/shared/Breadcrumbs'
import ChartCard from '@/components/shared/ChartCard'
import DateRangeFilter from '@/components/shared/DateRangeFilter'
import PageHeader from '@/components/shared/PageHeader'
import StatCard, { StatCardSkeleton, changeBetween } from '@/components/shared/StatCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import SegmentedControl from '@/components/ui/form/SegmentedControl'
import NeedsAttentionPanel from '@/features/dashboard/components/NeedsAttentionPanel'
import OrdersStatusChart from '@/features/dashboard/components/OrdersStatusChart'
import RecentOrdersList, { RecentOrdersSkeleton } from '@/features/dashboard/components/RecentOrdersList'
import SalesTrendChart from '@/features/dashboard/components/SalesTrendChart'
import Sparkline from '@/features/dashboard/components/Sparkline'
import TopProductsList, { TopProductsSkeleton } from '@/features/dashboard/components/TopProductsList'
import { useDashboard, useDashboardSummary } from '@/features/dashboard/hooks/useDashboard'
import {
  DASHBOARD_PRESETS,
  QUICK_PRESETS,
  defaultRange,
  presetRange,
  previousCaption,
  rangeError,
  resolveRange
} from '@/features/dashboard/range'
import type { DashboardSummary } from '@/features/dashboard/types'
import { formatDateRange, matchPreset, type DateRange } from '@/libs/dateRange'
import { formatCurrency, formatNumber } from '@/libs/format'

const SPARK_HEIGHT = 28

const viewAll = (href: string, label: string) => (
  <Link href={href}>
    <Button size='sm' variant='text' endIcon={<i className='tabler-arrow-right' />}>
      {label}
    </Button>
  </Link>
)

type KpiRowProps = { data?: DashboardSummary; caption: string }

const KpiRow = ({ data, caption }: KpiRowProps) => {
  if (!data) return [...Array(4)].map((_, i) => <StatCardSkeleton key={i} chartHeight={SPARK_HEIGHT} />)

  const { totals, previous, series } = data

  const spark = (key: 'revenue' | 'orders' | 'newCustomers') => (
    <Sparkline values={series.map(p => p[key])} height={SPARK_HEIGHT} />
  )

  return (
    <>
      <StatCard
        title='Revenue · excl. cancelled'
        value={formatCurrency(totals.revenue)}
        icon='tabler-currency-dirham'
        trend={{ change: changeBetween(totals.revenue, previous.revenue), caption }}
        chart={spark('revenue')}
      />
      <StatCard
        title='Orders · excl. cancelled'
        value={formatNumber(totals.orders)}
        icon='tabler-shopping-cart'
        color='info'
        trend={{ change: changeBetween(totals.orders, previous.orders), caption }}
        chart={spark('orders')}
      />
      <StatCard
        title='Average order value'
        value={formatCurrency(totals.aov)}
        icon='tabler-receipt'
        color='secondary'
        trend={{ change: changeBetween(totals.aov, previous.aov), caption }}
      />
      <StatCard
        title='New customer accounts'
        value={formatNumber(totals.newCustomers)}
        icon='tabler-user-plus'
        color='success'
        trend={{ change: changeBetween(totals.newCustomers, previous.newCustomers), caption }}
        chart={spark('newCustomers')}
      />
    </>
  )
}

const DashboardView = () => {
  const [range, setRange] = useState<Required<DateRange>>(defaultRange)
  const [pickError, setPickError] = useState<string | null>(null)
  const resolved = useMemo(() => resolveRange(range), [range])
  const summary = useDashboardSummary(resolved)
  const overview = useDashboard()

  const data = summary.data
  const caption = previousCaption(range)
  const quick = matchPreset(range, DASHBOARD_PRESETS)?.id

  // A custom range simply leaves no quick option selected; the picker shows it.
  const quickValue: string = QUICK_PRESETS.some(p => p.id === quick) ? quick! : ''
  const hasOrders = !!data && data.totals.orders > 0
  const hasAnyOrderInRange = !!data && Object.values(data.ordersByStatus).some(n => (n ?? 0) > 0)
  const refetching = summary.isFetching && summary.isPlaceholderData

  // A brand-new store reads differently from a quiet week.
  const storeHasOrders = (overview.data?.recentOrders.length ?? 0) > 0

  const noOrdersCopy = storeHasOrders
    ? { title: 'No orders in this range', description: 'Pick a longer range to see sales.' }
    : { title: 'No orders yet', description: 'Sales will chart here once the first order comes in.' }

  const summaryState = {
    isLoading: !data && !summary.isError,
    isError: summary.isError && !data,
    errorMessage: (summary.error as Error | null)?.message,
    onRetry: () => summary.refetch(),
    isRefetching: refetching
  }

  const pickRange = (next: DateRange) => {
    const error = rangeError(next)

    setPickError(error)
    if (!error) setRange(next as Required<DateRange>)
  }

  const granularityNote = data?.range.granularity === 'month' ? 'per month' : 'per day'

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title='Dashboard'
        icon='tabler-layout-dashboard'
        subtitle='What needs doing today, then how the store is performing'
      />

      <div className='flex flex-col gap-8'>
        <NeedsAttentionPanel />

        <section aria-labelledby='performance-heading' className='flex min-w-0 flex-col gap-4'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
            <div className='flex min-w-0 flex-col gap-0.5'>
              <h2 id='performance-heading' className='text-base font-semibold tracking-[-0.01em] text-textPrimary'>
                Performance
              </h2>
              <p className='text-xs text-textMuted'>
                {formatDateRange(range, DASHBOARD_PRESETS)} · compared with the {caption}
              </p>
            </div>
            <div className='flex min-w-0 flex-wrap items-center gap-2'>
              <SegmentedControl
                aria-label='Quick date range'
                size='sm'
                value={quickValue}
                options={QUICK_PRESETS.map(p => ({ value: p.id as string, label: p.label }))}
                onChange={id => pickRange(presetRange(id))}
              />
              <DateRangeFilter
                label='Range'
                value={range}
                onChange={pickRange}
                presets={DASHBOARD_PRESETS}
                clearable={false}
              />
            </div>
          </div>

          {pickError && (
            <Alert severity='warning' onClose={() => setPickError(null)}>
              {pickError}. Showing {formatDateRange(range, DASHBOARD_PRESETS).toLowerCase()} instead.
            </Alert>
          )}

          {summary.isError && !data ? (
            <Alert
              severity='error'
              title='Could not load performance figures'
              action={
                <Button
                  size='sm'
                  variant='outlined'
                  color='error'
                  startIcon={<i className='tabler-refresh' />}
                  onClick={() => summary.refetch()}
                >
                  Retry
                </Button>
              }
            >
              {summaryState.errorMessage || 'The summary request failed.'}
            </Alert>
          ) : (
            <div
              className='grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-4'
              style={{ opacity: refetching ? 0.6 : 1 }}
              aria-busy={!data || refetching || undefined}
            >
              <KpiRow data={data} caption={caption} />
            </div>
          )}
          {summary.isError && data && (
            <Alert
              severity='error'
              action={
                <Button size='sm' variant='outlined' color='error' onClick={() => summary.refetch()}>
                  Retry
                </Button>
              }
            >
              Couldn’t refresh for the new range — showing the previous figures.
            </Alert>
          )}

          <ChartCard
            title='Sales over time'
            icon='tabler-chart-line'
            description={`Revenue and orders ${granularityNote}, cancelled orders excluded`}
            {...summaryState}
            height={340}
            empty={
              !!data &&
              (!hasOrders
                ? { ...noOrdersCopy, icon: 'tabler-chart-line' }
                : data.series.length < 2 && {
                    icon: 'tabler-chart-line',
                    title: 'One period, no trend to draw',
                    description: 'The totals are in the cards above. Pick a longer range to see sales over time.'
                  })
            }
          >
            {data && <SalesTrendChart data={data.series} granularity={data.range.granularity} />}
          </ChartCard>

          <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-12'>
            <ChartCard
              title='Top selling products'
              icon='tabler-trophy'
              description='Top 5 by sales value in this range'
              {...summaryState}
              className='lg:col-span-7'
              skeleton={<TopProductsSkeleton />}
              empty={
                !!data &&
                !data.topProducts.length && {
                  ...noOrdersCopy,
                  icon: 'tabler-trophy',
                  description: storeHasOrders
                    ? 'No products sold in this range.'
                    : 'Best sellers will appear here once orders come in.'
                }
              }
              action={data?.topProducts.length ? viewAll('/products', 'All products') : undefined}
            >
              {data && <TopProductsList products={data.topProducts} />}
            </ChartCard>
            <ChartCard
              title='Orders by status'
              icon='tabler-chart-bar'
              description='Every order placed in the range, cancelled included'
              {...summaryState}
              height={140}
              empty={
                !!data &&
                !hasAnyOrderInRange && {
                  title: noOrdersCopy.title,
                  description: storeHasOrders
                    ? 'No orders were placed in this range.'
                    : 'The status mix will show here once orders come in.'
                }
              }
              className='lg:col-span-5'
            >
              {data && <OrdersStatusChart byStatus={data.ordersByStatus} />}
            </ChartCard>
          </div>
        </section>

        <section aria-label='Latest orders'>
          <ChartCard
            title='Latest orders'
            icon='tabler-receipt'
            description='The 10 most recent orders, any date and status'
            isLoading={overview.isLoading}
            isError={overview.isError}
            errorMessage={(overview.error as Error | null)?.message}
            onRetry={() => overview.refetch()}
            skeleton={<RecentOrdersSkeleton />}
            bodyPadding='none'
            empty={
              !!overview.data &&
              !overview.data.recentOrders.length && {
                icon: 'tabler-shopping-cart-off',
                title: 'No orders yet',
                description: 'New customer orders will show up here as they arrive.'
              }
            }
            action={overview.data?.recentOrders.length ? viewAll('/orders', 'View all') : undefined}
          >
            {overview.data && <RecentOrdersList orders={overview.data.recentOrders} />}
          </ChartCard>
        </section>
      </div>
    </>
  )
}

export default DashboardView
