import type { ReactNode } from 'react'

import classnames from 'classnames'

type FactProps = {
  label: string
  children: ReactNode

  /** Small note under the value, e.g. what a number means. */
  hint?: string

  /** Medium weight for facts that are the point of the block, not supporting text. */
  strong?: boolean
}

/** A label-over-value pair for a `<dl>` on a detail page. */
const Fact = ({ label, children, hint, strong }: FactProps) => (
  <div className='flex min-w-0 flex-col gap-0.5'>
    <dt className='text-xs text-textMuted'>{label}</dt>
    <dd className={classnames('text-sm text-textPrimary wrap-break-word', strong && 'font-medium')}>{children}</dd>
    {hint && <p className='text-xs text-textMuted'>{hint}</p>}
  </div>
)

export default Fact
