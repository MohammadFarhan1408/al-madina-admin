import Fact from '@/components/shared/Fact'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import { humanize } from '@/libs/format'
import type { AdminOrder } from '@/features/orders/types'

/** Where the order is going and how. */
const OrderDeliveryCard = ({ order }: { order: AdminOrder }) => (
  <Card>
    <CardHeader title='Delivery' />
    <CardBody>
      <dl className='flex flex-col gap-3'>
        <Fact label='Ship to'>
          <address className='not-italic leading-6'>
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.address}
            <br />
            {order.shippingAddress.city}
          </address>
        </Fact>
        <Fact label='Method'>
          <span className='flex items-center gap-1.5'>
            <i
              aria-hidden
              className={order.deliveryMethod === 'express' ? 'tabler-bolt text-primaryInk' : 'tabler-truck'}
            />
            {humanize(order.deliveryMethod)}
          </span>
        </Fact>
      </dl>
    </CardBody>
  </Card>
)

export default OrderDeliveryCard
