import StatusChip from '@/components/shared/StatusChip'
import { formatDateTime } from '@/libs/format'
import type { StatusChange } from '@/features/orders/types'

/** Status history, oldest first. Orders placed before the timeline existed have
 *  no entries, so say so instead of showing an empty box. */
const OrderTimeline = ({ history }: { history?: StatusChange[] }) => {
  if (!history?.length) {
    return <p className='text-sm text-textMuted'>No status history was recorded for this order.</p>
  }

  return (
    <ol className='flex flex-col'>
      {history.map((entry, i) => (
        <li key={`${entry.status}-${entry.at}`} className='relative flex gap-3 pb-4 last:pb-0'>
          {i < history.length - 1 && <span aria-hidden className='absolute top-4 bottom-0 left-[5px] w-px bg-border' />}
          <span
            aria-hidden
            className='relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-primaryInk bg-backgroundPaper'
          />
          <div className='flex flex-col gap-0.5'>
            <StatusChip value={entry.status} />
            <span className='text-xs text-textMuted'>{formatDateTime(entry.at)}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default OrderTimeline
