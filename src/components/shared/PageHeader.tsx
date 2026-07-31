import type { ReactNode } from 'react'

import classnames from 'classnames'

type PageHeaderProps = {
  title: string

  /** One line of context under the title. Sentence case, no trailing period. */
  subtitle?: string

  /** Right-aligned page actions — the primary action last. */
  action?: ReactNode

  /** Full-width row below the title, for filters or tabs that belong to the
   *  page rather than to a card. */
  children?: ReactNode
  className?: string
}

/** The single page-title treatment. One h1 per page at one size, so the top of
 *  every screen has the same hierarchy: breadcrumb → title → subtitle → action.
 *
 *  Actions wrap below the title on narrow screens instead of squeezing it, and
 *  go full-width there so a primary button isn't a 90px tap target. */
const PageHeader = ({ title, subtitle, action, children, className }: PageHeaderProps) => (
  <div className={classnames('mb-5 flex flex-col gap-4 md:mb-6', className)}>
    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
      <div className='flex min-w-0 flex-col gap-1'>
        <h1 className='text-xl font-semibold tracking-[-0.015em] text-textPrimary md:text-2xl'>{title}</h1>
        {subtitle && <p className='max-w-2xl text-sm text-textMuted'>{subtitle}</p>}
      </div>
      {action && (
        <div className='flex shrink-0 flex-wrap items-center gap-2 max-sm:*:flex-1 sm:justify-end'>{action}</div>
      )}
    </div>
    {children}
  </div>
)

export default PageHeader
