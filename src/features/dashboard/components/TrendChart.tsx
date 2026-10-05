'use client'

import { useId } from 'react'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatBucket, formatCompact } from '@/libs/format'
import type { SummaryPoint } from '@/features/dashboard/types'
import { CHART_COLORS } from './constants'

type TrendChartProps = {
  data: SummaryPoint[]
  dataKey: 'revenue' | 'orders' | 'newCustomers'

  /** Name of the measure, for the tooltip and the screen-reader table. */
  label: string
  format?: (value: number) => string
  height?: number
}

const axisTick = { fill: 'var(--color-textMuted)', fontSize: 12 }

/** One measure over time. A single series, so no legend: the card title names
 *  it. The grid is recessive, the line is 2px, the area is a faint wash, and
 *  the tooltip follows the cursor along the x axis. A visually-hidden table
 *  carries the same numbers for screen readers. */
const TrendChart = ({ data, dataKey, label, format = String, height = 240 }: TrendChartProps) => {
  const gradientId = `trend-${useId().replace(/:/g, '')}`

  return (
    <>
      <div role='img' aria-label={`${label} over time`}>
        <ResponsiveContainer width='100%' height={height}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={CHART_COLORS.primaryInk} stopOpacity={0.22} />
                <stop offset='100%' stopColor={CHART_COLORS.primaryInk} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke='var(--color-border)' vertical={false} />
            <XAxis
              dataKey='date'
              tickFormatter={formatBucket}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              tick={axisTick}
              minTickGap={28}
            />
            <YAxis
              allowDecimals={false}
              tickFormatter={formatCompact}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              width={44}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-borderStrong)', strokeDasharray: '3 3' }}
              labelFormatter={value => formatBucket(String(value))}
              formatter={value => [format(Number(value ?? 0)), label]}
              contentStyle={{
                background: 'var(--color-backgroundPaper)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 13
              }}
            />
            <Area
              type='monotone'
              dataKey={dataKey}
              stroke={CHART_COLORS.primaryInk}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, stroke: 'var(--color-backgroundPaper)', strokeWidth: 2 }}
              dot={data.length <= 31 ? { r: 2.5, fill: CHART_COLORS.primaryInk, strokeWidth: 0 } : false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <table className='sr-only'>
        <caption>{label} by period</caption>
        <thead>
          <tr>
            <th scope='col'>Period</th>
            <th scope='col'>{label}</th>
          </tr>
        </thead>
        <tbody>
          {data.map(p => (
            <tr key={p.date}>
              <th scope='row'>{formatBucket(p.date)}</th>
              <td>{format(p[dataKey])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default TrendChart
