import Card, { CardBody } from '@/components/ui/Card'
import Select from '@/components/ui/form/Select'
import { humanize } from '@/libs/format'
import { ORDER_STATUSES, type AdminOrder, type OrderStatus } from '@/features/orders/types'
import OrderProgress from '../OrderProgress'

type OrderFulfilmentProps = {
  order: AdminOrder

  /** Stages the new status; the page applies it only after a confirm dialog. */
  onSelectStatus: (status: OrderStatus) => void
  updating: boolean
}

/** Processing → Shipped → Delivered stepper beside the status control. */
const OrderFulfilment = ({ order, onSelectStatus, updating }: OrderFulfilmentProps) => (
  <Card>
    <CardBody padding='lg' className='flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between'>
      <div className='min-w-0 flex-1'>
        <OrderProgress status={order.status} history={order.statusHistory} placedAt={order.placedAt} />
      </div>
      <div className='flex w-full flex-col gap-1.5 xl:w-56 xl:border-l xl:border-border xl:pl-6'>
        <Select
          label='Update status'
          value={order.status}
          onChange={e => onSelectStatus(e.target.value as OrderStatus)}
          disabled={updating}
          options={ORDER_STATUSES.map(status => ({ label: humanize(status), value: status }))}
        />
        <span className='text-xs text-textMuted'>You&apos;ll confirm before anything changes.</span>
      </div>
    </CardBody>
  </Card>
)

export default OrderFulfilment
