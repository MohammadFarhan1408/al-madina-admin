import Link from 'next/link'

import StatusChip from '@/components/shared/StatusChip'
import Skeleton from '@/components/ui/Skeleton'
import { formatCurrency, formatDateTime } from '@/libs/format'
import type { Order } from '@/features/orders/types'

type RecentOrdersListProps = { orders: Order[] }

const OrderThumb = ({ order }: { order: Order }) => {
  const image = order.items.find(i => i.productImage)?.productImage

  return image ? (
    <img src={image} alt='' className='size-10 shrink-0 rounded-md border border-border object-cover' />
  ) : (
    <span
      aria-hidden
      className='flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary/15 text-secondaryDark'
    >
      <i className='tabler-receipt text-[18px]' />
    </span>
  )
}

const itemCount = (order: Order) => order.items.reduce((n, i) => n + i.quantity, 0)

/** The latest orders as one scannable row each: what (thumbnail, reference,
 *  customer), when, how much, and both states — fulfilment and payment —
 *  labelled chips rather than colour alone. The whole row opens the order. */
const RecentOrdersList = ({ orders }: RecentOrdersListProps) => (
  <ul className='flex flex-col divide-y divide-border'>
    {orders.map(order => {
      const items = itemCount(order)

      return (
        <li key={order.id}>
          <Link
            href={`/orders/${order.id}`}
            className='grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-5 py-3 transition-colors hover:bg-actionHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset md:grid-cols-[auto_minmax(0,1fr)_11rem_7.5rem_15rem]'
          >
            <OrderThumb order={order} />
            <span className='flex min-w-0 flex-col'>
              <span className='truncate text-sm font-medium text-textPrimary'>{order.reference}</span>
              <span className='truncate text-xs text-textSecondary'>
                {order.shippingAddress?.fullName ?? order.guestEmail ?? 'Guest'}
              </span>
            </span>
            <span className='hidden min-w-0 flex-col md:flex'>
              <span className='truncate text-sm text-textPrimary'>{formatDateTime(order.placedAt)}</span>
              <span className='truncate text-xs text-textMuted'>
                {items} {items === 1 ? 'item' : 'items'}
              </span>
            </span>
            <span className='text-right text-sm font-semibold tabular-nums text-textPrimary'>
              {formatCurrency(order.total, order.currency)}
            </span>
            <span className='col-span-3 flex flex-wrap items-center gap-1.5 pl-[3.25rem] md:col-span-1 md:justify-end md:pl-0'>
              <StatusChip value={order.status} dot />
              <StatusChip value={order.paymentStatus} label={`Payment ${order.paymentStatus}`} />
              <span className='text-xs text-textMuted md:hidden'>· {formatDateTime(order.placedAt)}</span>
            </span>
          </Link>
        </li>
      )
    })}
  </ul>
)

export const RecentOrdersSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <ul className='flex flex-col divide-y divide-border'>
    {[...Array(rows)].map((_, i) => (
      <li key={i} className='flex items-center gap-3 px-5 py-3'>
        <Skeleton variant='block' className='size-10' />
        <span className='flex flex-1 flex-col gap-1.5'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-3 w-36' />
        </span>
        <Skeleton className='h-4 w-20' />
      </li>
    ))}
  </ul>
)

export default RecentOrdersList
