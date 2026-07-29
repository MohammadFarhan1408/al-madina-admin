import type { HTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

export type AlertSeverity = 'success' | 'error' | 'warning' | 'info'

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  severity?: AlertSeverity
  onClose?: () => void
  icon?: ReactNode
}

const severityClasses: Record<AlertSeverity, string> = {
  success: 'bg-successLight text-successDark border-success/30',
  error: 'bg-errorLight text-error border-error/30',
  warning: 'bg-warningLight text-warningDark border-warning/30',
  info: 'bg-infoLight text-infoDark border-info/30'
}

const severityIcon: Record<AlertSeverity, string> = {
  success: 'tabler-circle-check',
  error: 'tabler-alert-circle',
  warning: 'tabler-alert-triangle',
  info: 'tabler-info-circle'
}

const Alert = ({ severity = 'info', onClose, icon, className, children, ...props }: AlertProps) => (
  <div
    role='alert'
    className={classnames('flex items-start gap-2 rounded-md border px-4 py-3 text-sm', severityClasses[severity], className)}
    {...props}
  >
    {icon ?? <i className={classnames(severityIcon[severity], 'mt-0.5 text-base')} />}
    <div className='flex-1'>{children}</div>
    {onClose && (
      <button type='button' onClick={onClose} aria-label='Dismiss' className='-m-1 rounded p-1 hover:bg-black/5'>
        <i className='tabler-x text-base' />
      </button>
    )}
  </div>
)

export default Alert
