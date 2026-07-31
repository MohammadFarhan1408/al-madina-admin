import type { HTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

import IconButton from './IconButton'

export type AlertSeverity = 'success' | 'error' | 'warning' | 'info'

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  severity?: AlertSeverity

  /** Short bold lead-in above the body copy, for when the message needs a
   *  headline as well as an explanation. */
  title?: ReactNode
  onClose?: () => void
  icon?: ReactNode

  /** Recovery action — an alert that states a problem without offering a way
   *  out leaves the user stuck. */
  action?: ReactNode
}

/* A tint plus a full 1px border. Never a thick left stripe: that pattern reads
   as an accident and breaks the alignment of everything stacked beside it. */
const severityClasses: Record<AlertSeverity, string> = {
  success: 'border-success/35 bg-successLight text-successDark',
  error: 'border-error/35 bg-errorLight text-errorDark',
  warning: 'border-warning/40 bg-warningLight text-warningInk',
  info: 'border-info/35 bg-infoLight text-infoDark'
}

const iconColorClasses: Record<AlertSeverity, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info'
}

const severityIcon: Record<AlertSeverity, string> = {
  success: 'tabler-circle-check',
  error: 'tabler-alert-circle',
  warning: 'tabler-alert-triangle',
  info: 'tabler-info-circle'
}

/** Inline message block. `role='alert'` for errors and warnings (interrupts the
 *  screen reader, which is right for a problem) and `role='status'` for success
 *  and info (announced politely, without cutting off what's being read). */
const Alert = ({ severity = 'info', title, onClose, icon, action, className, children, ...props }: AlertProps) => (
  <div
    role={severity === 'error' || severity === 'warning' ? 'alert' : 'status'}
    className={classnames(
      'flex items-center gap-3 rounded-md border px-3.5 py-3 text-sm',
      severityClasses[severity],
      className
    )}
    {...props}
  >
    <span aria-hidden className={classnames('flex shrink-0 items-center', iconColorClasses[severity])}>
      {icon ?? <i className={classnames(severityIcon[severity], 'text-[18px]')} />}
    </span>
    {title ? (
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <p className='font-semibold'>{title}</p>
        {children && <div className='min-w-0 [&_a]:underline [&_a]:underline-offset-2'>{children}</div>}
        {action && <div className='mt-1 flex flex-wrap items-center gap-2'>{action}</div>}
      </div>
    ) : (
      <div className='flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3'>
        {children && <div className='min-w-0 [&_a]:underline [&_a]:underline-offset-2'>{children}</div>}
        {action && <div className='flex shrink-0 flex-wrap items-center gap-2'>{action}</div>}
      </div>
    )}
    {onClose && (
      <IconButton
        size='sm'
        aria-label='Dismiss message'
        onClick={onClose}
        className='-mr-1 -mt-0.5 text-current hover:bg-current/10'
      >
        <i className='tabler-x' />
      </IconButton>
    )}
  </div>
)

export default Alert
