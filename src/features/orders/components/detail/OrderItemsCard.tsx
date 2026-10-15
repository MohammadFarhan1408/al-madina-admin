import type { ReactNode } from 'react'

import Link from 'next/link'

import Badge from '@/components/ui/Badge'
import Card, { CardHeader } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'
import { formatCurrency, humanize } from '@/libs/format'
import type { AdminOrder } from '@/features/orders/types'

const TotalRow = ({ label, children, strong }: { label: ReactNode; children: ReactNode; strong?: boolean }) => (
  <div className='flex items-baseline justify-between gap-6'>
    <dt className={strong ? 'text-sm font-semibold text-textPrimary' : 'text-sm text-textSecondary'}>{label}</dt>
    <dd
      className={
        strong ? 'text-lg font-semibold tabular-nums text-textPrimary' : 'text-sm tabular-nums text-textPrimary'
      }
    >
      {children}
    </dd>
  </div>
)

/** The ordered products and the totals breakdown under them. */
const OrderItemsCard = ({ order }: { order: AdminOrder }) => {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Card className='overflow-hidden'>
      <CardHeader
        title='Items'
        icon='tabler-package'
        description={`${order.items.length} product${order.items.length === 1 ? '' : 's'} · ${itemCount} unit${itemCount === 1 ? '' : 's'}`}
        divided={false}
      />
      <Table aria-label='Order items'>
        <TableHead>
          <TableRow>
            <TableHeaderCell className='pl-5'>Product</TableHeaderCell>
            <TableHeaderCell align='right'>Unit price</TableHeaderCell>
            <TableHeaderCell align='right'>Qty</TableHeaderCell>
            <TableHeaderCell align='right' className='pr-5'>
              Total
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {order.items.map((item, idx) => (
            <TableRow key={`${item.productId}-${item.volumeMl}-${idx}`}>
              <TableCell className='pl-5'>
                <div className='flex min-w-0 items-center gap-3'>
                  <span className='flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surfaceSunken/40'>
                    {item.productImage ? (
                      <img src={item.productImage} alt='' className='size-full object-cover' />
                    ) : (
                      <i aria-hidden className='tabler-photo text-textMuted' />
                    )}
                  </span>
                  <span className='flex min-w-0 flex-col'>
                    <Link
                      href={`/products/${item.productId}`}
                      className='truncate rounded-xs text-sm font-medium text-textPrimary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
                    >
                      {item.productName}
                    </Link>
                    <span className='text-xs text-textMuted'>{item.volumeMl}ml</span>
                  </span>
                </div>
              </TableCell>
              <TableCell align='right' className='whitespace-nowrap tabular-nums'>
                {formatCurrency(item.price, order.currency)}
              </TableCell>
              <TableCell align='right' className='tabular-nums'>
                ×{item.quantity}
              </TableCell>
              <TableCell align='right' className='pr-5 font-medium whitespace-nowrap tabular-nums'>
                {formatCurrency(item.price * item.quantity, order.currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className='flex justify-end border-t border-border bg-surfaceSunken/25 px-5 py-4'>
        <dl className='flex w-full max-w-80 flex-col gap-2'>
          <TotalRow label='Subtotal'>{formatCurrency(order.subtotal, order.currency)}</TotalRow>
          <TotalRow label={`Shipping · ${humanize(order.deliveryMethod)}`}>
            {order.shipping === 0 ? 'Free' : formatCurrency(order.shipping, order.currency)}
          </TotalRow>
          {!!order.discountAmount && (
            <TotalRow
              label={
                <span className='flex items-center gap-1.5'>
                  Discount
                  {order.couponCode && (
                    <Badge size='sm' color='success'>
                      {order.couponCode}
                    </Badge>
                  )}
                </span>
              }
            >
              <span className='text-successDark'>−{formatCurrency(order.discountAmount, order.currency)}</span>
            </TotalRow>
          )}
          <div className='my-1 border-t border-border' />
          <TotalRow label='Total' strong>
            {formatCurrency(order.total, order.currency)}
          </TotalRow>
        </dl>
      </div>
    </Card>
  )
}

export default OrderItemsCard
