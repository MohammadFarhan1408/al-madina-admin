import type { HTMLAttributes } from 'react'

import classnames from 'classnames'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  hoverable?: boolean
}

const Card = ({ hoverable = false, className, children, ...props }: CardProps) => (
  <div
    className={classnames(
      'rounded-lg bg-backgroundPaper border border-secondary/35 shadow-sm transition-[box-shadow,border-color]',
      hoverable && 'hover:border-primary/35 hover:shadow-md',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>

export const CardHeader = ({ className, children, ...props }: CardHeaderProps) => (
  <div className={classnames('flex items-center justify-between gap-4 border-b border-secondary/20 p-4', className)} {...props}>
    {children}
  </div>
)

export type CardBodyProps = HTMLAttributes<HTMLDivElement>

export const CardBody = ({ className, children, ...props }: CardBodyProps) => (
  <div className={classnames('p-4', className)} {...props}>
    {children}
  </div>
)

export type CardFooterProps = HTMLAttributes<HTMLDivElement>

export const CardFooter = ({ className, children, ...props }: CardFooterProps) => (
  <div className={classnames('flex items-center justify-end gap-2 border-t border-secondary/20 p-4', className)} {...props}>
    {children}
  </div>
)

export default Card
