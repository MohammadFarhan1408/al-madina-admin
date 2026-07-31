'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import Skeleton from '@/components/ui/Skeleton'
import { formatCurrency } from '@/libs/format'
import type { RevenueBreakdown } from '@/features/dashboard/types'
import { CHART_COLORS } from './constants'

type RevenueChartProps = {
  revenue?: RevenueBreakdown
  isLoading: boolean
}

const RevenueChart = ({ revenue, isLoading }: RevenueChartProps) => {
  if (isLoading) return <Skeleton variant='block' className='h-60 w-full' />

  const data = [
    { period: 'Today', amount: revenue?.today ?? 0 },
    { period: 'This week', amount: revenue?.week ?? 0 },
    { period: 'This month', amount: revenue?.month ?? 0 }
  ]

  return (
    <ResponsiveContainer width='100%' height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='var(--color-border)' vertical={false} />
        <XAxis
          dataKey='period'
          tickLine={false}
          axisLine={{ stroke: 'var(--color-border)' }}
          tick={{ fill: 'var(--color-textMuted)', fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--color-textMuted)', fontSize: 12 }}
          tickFormatter={value => formatCurrency(value)}
          width={70}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-actionHover)' }}
          formatter={(value: unknown) => formatCurrency(Number(value ?? 0))}
          contentStyle={{
            background: 'var(--color-backgroundPaper)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 13
          }}
        />
        <Bar dataKey='amount' fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} maxBarSize={64} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default RevenueChart
