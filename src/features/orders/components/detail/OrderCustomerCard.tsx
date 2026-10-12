import Link from 'next/link'

import Fact from '@/components/shared/Fact'
import Badge from '@/components/ui/Badge'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import type { AdminOrder } from '@/features/orders/types'

const initials = (fullName: string) =>
  fullName
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

/** Who placed the order: a link to the registered profile when there is one,
 *  plus the contact details given at checkout. */
const OrderCustomerCard = ({ order }: { order: AdminOrder }) => {
  const contactEmail = order.customer?.email ?? order.guestEmail

  return (
    <Card>
      <CardHeader
        title='Customer'
        action={
          <Badge size='sm' color={order.customer ? 'info' : 'neutral'}>
            {order.customer ? 'Registered' : 'Guest'}
          </Badge>
        }
      />
      <CardBody className='flex flex-col gap-4'>
        {order.customer && (
          <Link
            href={`/customers/${order.customer.id}`}
            className='group flex min-h-11 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
          >
            <span
              aria-hidden
              className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/16 text-sm font-semibold text-primaryInk'
            >
              {initials(order.customer.fullName)}
            </span>
            <span className='flex min-w-0 flex-col'>
              <span className='truncate text-sm font-medium text-primaryInk group-hover:underline'>
                {order.customer.fullName}
              </span>
              <span className='text-xs text-textMuted'>View customer profile</span>
            </span>
          </Link>
        )}
        <dl className='flex flex-col gap-3'>
          <Fact label='Name'>{order.shippingAddress.fullName}</Fact>
          <Fact label='Phone'>
            <a href={`tel:${order.shippingAddress.phone}`} className='text-primaryInk hover:underline'>
              {order.shippingAddress.phone}
            </a>
          </Fact>
          <Fact label='Email'>
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className='text-primaryInk hover:underline'>
                {contactEmail}
              </a>
            ) : (
              <span className='text-textMuted'>—</span>
            )}
          </Fact>
        </dl>
      </CardBody>
    </Card>
  )
}

export default OrderCustomerCard
