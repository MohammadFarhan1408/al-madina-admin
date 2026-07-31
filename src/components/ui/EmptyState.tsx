import type { ReactNode } from 'react'

import classnames from 'classnames'

export type EmptyStateSize = 'sm' | 'md'

export type EmptyStateProps = {

  /** Tabler icon class, e.g. `tabler-package-off`. */
  icon?: string
  title: string

  /** One sentence that tells the user what belongs here or why it's empty —
   *  not a restatement of the title. */
  description?: ReactNode

  /** The action that resolves the emptiness (create the first record, clear a
   *  filter). Omit when there is nothing the user can do. */
  action?: ReactNode
  size?: EmptyStateSize
  className?: string
}

/** Shared empty state. An empty surface should teach the interface, so this
 *  always renders a title and leaves room for the action that fills it —
 *  rather than the bare centred "No records found" string it replaces. */
const EmptyState = ({ icon = 'tabler-inbox', title, description, action, size = 'md', className }: EmptyStateProps) => (
  <div
    className={classnames(
      'flex flex-col items-center justify-center text-center',
      size === 'md' ? 'gap-4 px-6 py-14' : 'gap-3 px-4 py-9',
      className
    )}
  >
    <span
      aria-hidden
      className={classnames(
        'flex items-center justify-center rounded-full border border-border bg-backgroundChat/50 text-primaryInk',
        size === 'md' ? 'size-14' : 'size-11'
      )}
    >
      <i className={classnames(icon, size === 'md' ? 'text-[26px]' : 'text-[20px]')} />
    </span>
    <div className='flex max-w-sm flex-col gap-1.5'>
      <p className={classnames('font-semibold text-textPrimary', size === 'md' ? 'text-base' : 'text-sm')}>{title}</p>
      {description && <p className='text-sm text-textMuted'>{description}</p>}
    </div>
    {action && <div className='mt-1 flex flex-wrap items-center justify-center gap-2'>{action}</div>}
  </div>
)

export default EmptyState
