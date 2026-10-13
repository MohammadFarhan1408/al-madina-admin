'use client'

import { useId } from 'react'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatBucket, formatCompact, formatCurrency } from '@/libs/format'
import type { Granularity, SummaryPoint } from '@/features/dashboard/types'

import ChartTooltip from './ChartTooltip'
import { AXIS_TICK, CHART_COLORS } from './constants'

type SalesTrendChartProps = {
  data: SummaryPoint[]
  granularity: Granularity
}

// Both plots share one left gutter and one right margin, so a period sits at
// the same x in each and the synced cursor runs straight through both.
const Y_WIDTH = 48
const MARGIN = { top: 8, right: 8, left: 0, bottom: 0 }

const integer = (v: number) => String(Math.round(v))

/** Round axis ticks (0 / 10K / 20K …, 0 / 2 / 4 …) from zero to just above the
 *  largest value — Recharts' own picks land on steps like 8.5K. */
function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1]

  const raw = max / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = Math.max(1, [1, 2, 5, 10].find(m => m * magnitude >= raw)! * magnitude)
  const ticks = [0]

  while (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step)

  return ticks
}

/**
 * Revenue and orders over time as two aligned charts (small multiples) on one
 * shared time axis — not one combined chart. The two measures have different
 * units and scales (AED in the thousands vs a handful of orders), so a single
 * plot would need a second y-axis, which invents a correlation from wherever
 * the two scales happen to line up. Stacked and synced, each keeps its own
 * honest zero-based scale and the reader still compares them period by period:
 * hovering either plot puts the cursor and a readout on both.
 *
 * Revenue is a line with a faint wash (a continuous amount); orders are
 * columns (discrete counts per period). Both are one series in the brand's
 * ink gold, so neither needs a legend — each panel's label names it.
 */
const SalesTrendChart = ({ data, granularity }: SalesTrendChartProps) => {
  const uid = useId().replace(/:/g, '')
  const syncId = `sales-${uid}`
  const gradientId = `sales-wash-${uid}`
  const showDots = data.length <= 31
  const period = granularity === 'month' ? 'Month' : 'Day'
  const revenueTicks = niceTicks(Math.max(...data.map(p => p.revenue)))
  const orderTicks = niceTicks(Math.max(...data.map(p => p.orders)))

  return (
    <div className='flex flex-col gap-1'>
      <p className='text-xs font-medium text-textSecondary'>
        Revenue <span className='font-normal text-textMuted'>· AED</span>
      </p>
      <div role='img' aria-label={`Revenue per ${period.toLowerCase()}, in AED. Values are in the table below.`}>
        <ResponsiveContainer width='100%' height={180}>
          <AreaChart data={data} syncId={syncId} margin={{ ...MARGIN, bottom: 8 }}>
            <defs>
              <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={CHART_COLORS.primaryInk} stopOpacity={0.14} />
                <stop offset='100%' stopColor={CHART_COLORS.primaryInk} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey='date' hide />
            <YAxis
              allowDecimals={false}
              ticks={revenueTicks}
              domain={[0, revenueTicks[revenueTicks.length - 1]]}
              tickFormatter={formatCompact}
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
              width={Y_WIDTH}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-borderStrong)', strokeWidth: 1 }}
              content={props => <ChartTooltip {...props} name='Revenue' format={v => formatCurrency(v)} />}
            />
            <Area
              type='linear'
              dataKey='revenue'
              name='Revenue'
              stroke={CHART_COLORS.primaryInk}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              activeDot={{ r: 4, fill: CHART_COLORS.primaryInk, stroke: CHART_COLORS.surface, strokeWidth: 2 }}
              dot={
                showDots ? { r: 3, fill: CHART_COLORS.primaryInk, stroke: CHART_COLORS.surface, strokeWidth: 2 } : false
              }
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className='mt-3 text-xs font-medium text-textSecondary'>Orders</p>
      <div role='img' aria-label={`Orders per ${period.toLowerCase()}. Values are in the table below.`}>
        <ResponsiveContainer width='100%' height={128}>
          <BarChart data={data} syncId={syncId} margin={MARGIN} barCategoryGap={2}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey='date'
              tickFormatter={formatBucket}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tick={AXIS_TICK}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              ticks={orderTicks}
              domain={[0, orderTicks[orderTicks.length - 1]]}
              tickFormatter={formatCompact}
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
              width={Y_WIDTH}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-actionHover)' }}
              content={props => (
                <ChartTooltip {...props} name={props.payload?.[0]?.value === 1 ? 'order' : 'orders'} format={integer} />
              )}
            />
            <Bar
              dataKey='orders'
              name='Orders'
              fill={CHART_COLORS.primaryInk}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className='sr-only'>
        <caption>Revenue and orders per {period.toLowerCase()}</caption>
        <thead>
          <tr>
            <th scope='col'>{period}</th>
            <th scope='col'>Revenue (AED)</th>
            <th scope='col'>Orders</th>
          </tr>
        </thead>
        <tbody>
          {data.map(p => (
            <tr key={p.date}>
              <th scope='row'>{formatBucket(p.date)}</th>
              <td>{formatCurrency(p.revenue)}</td>
              <td>{p.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SalesTrendChart
