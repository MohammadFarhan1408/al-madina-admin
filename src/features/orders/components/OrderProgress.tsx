// Fulfilment stepper: Processing → Shipped → Delivered, with the time each
// step was reached (from statusHistory, when the order has one). A cancelled
// order shows the steps it reached, then the cancellation in place of the rest.
import classnames from 'classnames'

import { formatDateTime } from '@/libs/format'

import type { OrderStatus, StatusChange } from '../types'

const STEPS: { status: Exclude<OrderStatus, 'cancelled'>; label: string; icon: string }[] = [
  { status: 'processing', label: 'Processing', icon: 'tabler-package' },
  { status: 'shipped', label: 'Shipped', icon: 'tabler-truck-delivery' },
  { status: 'delivered', label: 'Delivered', icon: 'tabler-circle-check' }
]

type OrderProgressProps = {
  status: OrderStatus
  history?: StatusChange[]
  placedAt: string
}

/** Latest time the order entered `status`, if the history recorded it. */
const reachedAt = (history: StatusChange[] | undefined, status: OrderStatus) =>
  [...(history ?? [])].reverse().find(entry => entry.status === status)?.at

const OrderProgress = ({ status, history, placedAt }: OrderProgressProps) => {
  const cancelled = status === 'cancelled'

  // How far the order got: for a live order its current step; for a cancelled
  // one, the furthest step its history shows before cancellation.
  const reachedIndex = cancelled
    ? Math.max(0, ...STEPS.map((step, i) => (reachedAt(history, step.status) ? i : 0)))
    : STEPS.findIndex(step => step.status === status)

  const steps = cancelled ? STEPS.slice(0, reachedIndex + 1) : STEPS

  return (
    <ol aria-label='Fulfilment progress' className='flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0'>
      {steps.map((step, i) => {
        const done = i < reachedIndex || (!cancelled && i === reachedIndex && status === 'delivered')
        const current = !cancelled && i === reachedIndex && status !== 'delivered'
        const reached = i <= reachedIndex
        const at = reachedAt(history, step.status) ?? (step.status === 'processing' ? placedAt : undefined)

        return (
          <li key={step.status} className='relative flex flex-1 items-start gap-3 sm:flex-col sm:gap-2'>
            {/* Connector to the next step */}
            {(i < steps.length - 1 || cancelled) && (
              <span
                aria-hidden
                className={classnames(
                  'absolute hidden h-0.5 sm:top-[17px] sm:right-0 sm:left-11 sm:block',
                  i < reachedIndex ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
            <span
              aria-hidden
              className={classnames(
                'relative flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-base',
                done && 'border-primary bg-primary text-richBlack',
                current && 'border-primary bg-primary/16 text-primaryInk',
                !reached && 'border-border bg-backgroundPaper text-textMuted'
              )}
            >
              <i className={done ? 'tabler-check' : step.icon} />
            </span>
            <span className='flex min-w-0 flex-col sm:pr-4'>
              <span className={classnames('text-sm font-medium', reached ? 'text-textPrimary' : 'text-textMuted')}>
                {step.label}
                <span className='sr-only'>
                  {done ? ' — completed' : current ? ' — current step' : ' — not reached'}
                </span>
              </span>
              <span className='text-xs text-textMuted'>{reached && at ? formatDateTime(at) : 'Pending'}</span>
            </span>
          </li>
        )
      })}

      {cancelled && (
        <li className='relative flex flex-1 items-start gap-3 sm:flex-col sm:gap-2'>
          <span
            aria-hidden
            className='flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-error bg-error/12 text-base text-errorDark'
          >
            <i className='tabler-x' />
          </span>
          <span className='flex flex-col'>
            <span className='text-sm font-medium text-errorDark'>Cancelled</span>
            <span className='text-xs text-textMuted'>
              {reachedAt(history, 'cancelled') ? formatDateTime(reachedAt(history, 'cancelled')) : '—'}
            </span>
          </span>
        </li>
      )}
    </ol>
  )
}

export default OrderProgress
