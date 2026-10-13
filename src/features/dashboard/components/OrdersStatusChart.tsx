import { humanize } from '@/libs/format'
import { ORDER_STATUSES } from '@/features/orders/types'
import type { OrderStatusCounts } from '@/features/dashboard/types'

type OrdersStatusChartProps = { byStatus: Partial<OrderStatusCounts> }

/** Orders per status as horizontal bars on one shared scale (share of all
 *  orders in the range), not a pie or donut: four close values compare by
 *  length far better than by angle, and every bar is direct-labelled with its
 *  count and share, so nothing needs a legend or hover to read.
 *
 *  One colour for every bar: the status name on each row already says which is
 *  which, and the four status hues aren't colour-blind-safe side by side (red
 *  and green collapse for deuteranopes). Plain HTML, so it's a real list for
 *  screen readers. */
const OrdersStatusChart = ({ byStatus }: OrdersStatusChartProps) => {
  const rows = ORDER_STATUSES.map(status => ({ status, count: byStatus[status] ?? 0 }))
  const total = rows.reduce((sum, r) => sum + r.count, 0)

  return (
    <ul className='flex flex-col gap-3.5'>
      {rows.map(({ status, count }) => {
        const share = total ? count / total : 0

        return (
          <li key={status} className='grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-3 text-sm'>
            <span className='text-textPrimary'>{humanize(status)}</span>
            <span aria-hidden className='h-2.5 overflow-hidden rounded-xs bg-actionHover'>
              {count > 0 && (
                <span
                  className='block h-full rounded-r-xs bg-primaryInk'
                  style={{ width: `max(${share * 100}%, 4px)` }}
                />
              )}
            </span>
            <span className='min-w-[5.5rem] text-right tabular-nums'>
              <span className='font-medium text-textPrimary'>{count}</span>
              <span className='text-textMuted'> · {Math.round(share * 100)}%</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export default OrdersStatusChart
