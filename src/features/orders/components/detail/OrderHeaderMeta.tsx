import CopyValueButton from '@/components/shared/CopyValueButton'
import StatusChip from '@/components/shared/StatusChip'
import type { AdminOrder } from '@/features/orders/types'

/** The strip under the order title: order and payment status, copyable reference. */
const OrderHeaderMeta = ({ order }: { order: AdminOrder }) => (
  <div className='-mt-2 flex flex-wrap items-center gap-2'>
    <span className='text-xs text-textMuted'>Order</span>
    <StatusChip value={order.status} dot />
    <span className='ml-2 text-xs text-textMuted'>Payment</span>
    <StatusChip value={order.paymentStatus} dot />
    <span className='ml-2 flex items-center text-xs text-textMuted'>
      {order.reference}
      <CopyValueButton value={order.reference} label='Order reference' />
    </span>
  </div>
)

export default OrderHeaderMeta
