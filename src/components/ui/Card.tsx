import type { HTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  hoverable?: boolean

  /** Drop the border and shadow — for cards nested inside another surface,
   *  where a second frame would read as a box-in-a-box. */
  flush?: boolean
}

/** The container radius is `lg` (12px); child controls use `md` (8px), which
 *  keeps a visible concentric step between a card and the buttons inside it.
 *  Depth comes from the border first and a low-spread shadow second. */
const Card = ({ hoverable = false, flush = false, className, children, ...props }: CardProps) => (
  <div
    className={classnames(
      'rounded-lg bg-backgroundPaper transition-[box-shadow,border-color] duration-150 ease-out-quart',
      flush ? 'border border-border' : 'border border-border shadow-sm',
      hoverable && 'hover:border-borderStrong/60 hover:shadow-md',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'px-4 py-3',
  md: 'px-5 py-4',
  lg: 'px-6 py-5'
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {

  /** Renders the standard section heading, so callers stop hand-rolling
   *  `<h2 className='text-base font-semibold'>` at three different sizes. */
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  padding?: CardPadding

  /** Omit the divider when the body is visually self-contained (e.g. a table
   *  that draws its own header rule). */
  divided?: boolean
}

export const CardHeader = ({
  title,
  description,
  action,
  padding = 'md',
  divided = true,
  className,
  children,
  ...props
}: CardHeaderProps) => (
  <div
    className={classnames(
      'flex flex-wrap items-center justify-between gap-x-4 gap-y-3',
      divided && 'border-b border-border',
      paddingClasses[padding],
      className
    )}
    {...props}
  >
    {/* Either the structured title/description pair or free-form children —
        never both, so there's one obvious way to write a header. */}
    {title || description ? (
      <div className='flex min-w-0 flex-col gap-0.5'>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <p className='text-sm text-textMuted'>{description}</p>}
      </div>
    ) : (
      children
    )}
    {action && <div className='flex shrink-0 items-center gap-2'>{action}</div>}
  </div>
)

/** The one section-heading style. Every card, dialog and detail panel uses it,
 *  so h2-level text has a single size/weight/colour across the admin — a clear
 *  step above the 14px body text without shouting. */
export const CardTitle = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={classnames('truncate text-base font-semibold tracking-[-0.01em] text-textPrimary', className)}
    {...props}
  >
    {children}
  </h2>
)

export type CardBodyProps = HTMLAttributes<HTMLDivElement> & { padding?: CardPadding }

export const CardBody = ({ padding = 'md', className, children, ...props }: CardBodyProps) => (
  <div className={classnames(paddingClasses[padding], className)} {...props}>
    {children}
  </div>
)

export type CardFooterProps = HTMLAttributes<HTMLDivElement> & { padding?: CardPadding }

export const CardFooter = ({ padding = 'md', className, children, ...props }: CardFooterProps) => (
  <div
    className={classnames(
      'flex flex-wrap items-center justify-end gap-2 border-t border-border',
      paddingClasses[padding],
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export default Card
