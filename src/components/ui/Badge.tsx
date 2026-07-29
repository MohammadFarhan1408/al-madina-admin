import type { HTMLAttributes } from 'react'

import classnames from 'classnames'

export type BadgeColor = 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | 'neutral'
export type BadgeVariant = 'soft' | 'outlined' | 'filled'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  color?: BadgeColor
  variant?: BadgeVariant
}

const colorClasses: Record<BadgeColor, Record<BadgeVariant, string>> = {
  primary: {
    soft: 'bg-primary/15 text-primaryDark',
    outlined: 'border border-primary text-primaryDark',
    filled: 'bg-primary text-black'
  },
  secondary: {
    soft: 'bg-secondary/15 text-secondaryDark',
    outlined: 'border border-secondary text-secondaryDark',
    filled: 'bg-secondary text-white'
  },
  error: {
    soft: 'bg-error/15 text-error',
    outlined: 'border border-error text-error',
    filled: 'bg-error text-white'
  },
  success: {
    soft: 'bg-success/15 text-success',
    outlined: 'border border-success text-success',
    filled: 'bg-success text-white'
  },
  warning: {
    soft: 'bg-warning/15 text-warningDark',
    outlined: 'border border-warning text-warningDark',
    filled: 'bg-warning text-black'
  },
  info: {
    soft: 'bg-info/15 text-info',
    outlined: 'border border-info text-info',
    filled: 'bg-info text-white'
  },
  neutral: {
    soft: 'bg-textSecondary/15 text-textSecondary',
    outlined: 'border border-textSecondary/40 text-textSecondary',
    filled: 'bg-textSecondary text-white'
  }
}

const Badge = ({ color = 'neutral', variant = 'soft', className, children, ...props }: BadgeProps) => (
  <span
    className={classnames(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
      colorClasses[color][variant],
      className
    )}
    {...props}
  >
    {children}
  </span>
)

export default Badge
