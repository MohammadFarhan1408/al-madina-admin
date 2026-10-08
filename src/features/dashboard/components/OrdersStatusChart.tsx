'use client'

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { humanize } from '@/libs/format'
import { ORDER_STATUSES } from '@/features/orders/types'
import type { OrderStatusCounts } from '@/features/dashboard/types'
import { CHART_COLORS } from './constants'

type OrdersStatusChartProps = { byStatus: Partial<OrderStatusCounts> }

/** Orders per status for the selected range. One colour: the status name on
 *  the axis and the count at the end of each bar already say which is which, and
 *  the four status hues are not colour-blind-safe side by side (red and green
 *  collapse for deuteranopes). The status chips elsewhere keep their hues. */
const OrdersStatusChart = ({ byStatus }: OrdersStatusChartProps) => {
  const data = ORDER_STATUSES.map(status => ({ label: humanize(status), count: byStatus[status] ?? 0 }))

  return (
    <div role='img' aria-label={`Orders by status: ${data.map(d => `${d.label} ${d.count}`).join(', ')}`}>
      <ResponsiveContainer width='100%' height={240}>
        <BarChart data={data} layout='vertical' margin={{ top: 8, right: 32, left: 0, bottom: 0 }}>
          <XAxis type='number' hide />
          <YAxis
            type='category'
            dataKey='label'
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-textPrimary)', fontSize: 13 }}
            width={84}
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
          <Bar dataKey='count' name='Orders' fill={CHART_COLORS.primaryInk} radius={[0, 4, 4, 0]} maxBarSize={26}>
            <LabelList dataKey='count' position='right' fill='var(--color-textPrimary)' fontSize={13} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default OrdersStatusChart
