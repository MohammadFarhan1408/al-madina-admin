import Link from 'next/link'

import MobileRow from '@/components/shared/MobileRow'
import StatusChip from '@/components/shared/StatusChip'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableCellMeta, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/libs/format'
import type { Order } from '@/features/orders/types'

type RecentOrdersTableProps = {
  orders?: Order[]
  isLoading: boolean
}

const RecentOrdersTable = ({ orders, isLoading }: RecentOrdersTableProps) => {
  if (isLoading) {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Reference</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell align='right'>Total</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell align='right'>View</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={6}>
                <Skeleton className='h-5 w-full' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  if (!orders?.length) {
    return (
      <EmptyState
        size='sm'
        icon='tabler-shopping-cart-off'
        title='No orders yet'
        description='New customer orders will show up here as they arrive.'
      />
    )
  }

  return (
    <>
      <ul className='flex flex-col divide-y divide-border md:hidden'>
        {orders.map(order => (
          <li key={order.id} className='p-4'>
            <Link href={`/orders/${order.id}`} className='block'>
              <MobileRow
                title={order.reference}
                trailing={<StatusChip value={order.status} />}
                meta={[
                  order.shippingAddress?.fullName ?? order.guestEmail ?? '—',
                  formatDate(order.placedAt),
                  <span key='t' className='font-medium text-textPrimary'>
                    {formatCurrency(order.total, order.currency)}
                  </span>
                ]}
              />
            </Link>
          </li>
        ))}
      </ul>
      <div className='max-md:hidden'>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Reference</TableHeaderCell>
              <TableHeaderCell>Customer</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell align='right'>Total</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell align='right'>View</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map(order => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <span className='font-medium'>{order.reference}</span>
                </TableCell>
                <TableCell truncate>
                  {order.shippingAddress?.fullName ?? order.guestEmail ?? '—'}
                  {order.guestEmail && order.shippingAddress?.fullName && (
                    <TableCellMeta>{order.guestEmail}</TableCellMeta>
                  )}
                </TableCell>
                <TableCell>{formatDate(order.placedAt)}</TableCell>
                <TableCell align='right' className='font-medium tabular-nums'>
                  {formatCurrency(order.total, order.currency)}
                </TableCell>
                <TableCell>
                  <StatusChip value={order.status} />
                </TableCell>
                <TableCell align='right'>
                  <Link href={`/orders/${order.id}`}>
                    <Button size='sm' variant='outlined' color='secondary'>
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default RecentOrdersTable
