'use client'

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { humanize } from '@/libs/format'
import { ORDER_STATUSES } from '@/features/orders/types'
import type { OrderStatusCounts } from '@/features/dashboard/types'
import { ORDER_STATUS_CHART_COLORS } from './constants'

type OrdersStatusChartProps = {
  byStatus?: OrderStatusCounts
  isLoading: boolean
}

const OrdersStatusChart = ({ byStatus, isLoading }: OrdersStatusChartProps) => {
  if (isLoading) return <Skeleton variant='block' className='h-60 w-full' />

  const data = ORDER_STATUSES.map(status => ({ status, label: humanize(status), count: byStatus?.[status] ?? 0 }))
  const hasOrders = data.some(row => row.count > 0)

  if (!hasOrders) {
    return <EmptyState size='sm' icon='tabler-chart-bar-off' title='No orders yet' description='Order statuses will appear here once orders start coming in.' />
  }

  return (
    <ResponsiveContainer width='100%' height={240}>
      <BarChart data={data} layout='vertical' margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <XAxis type='number' allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-textMuted)', fontSize: 12 }} />
        <YAxis
          type='category'
          dataKey='label'
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--color-textPrimary)', fontSize: 12 }}
          width={80}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-actionHover)' }}
          contentStyle={{
            background: 'var(--color-backgroundPaper)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 13
          }}
        />
        <Bar dataKey='count' radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map(row => (
            <Cell key={row.status} fill={ORDER_STATUS_CHART_COLORS[row.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default OrdersStatusChart
