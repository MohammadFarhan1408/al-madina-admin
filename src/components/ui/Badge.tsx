import type { HTMLAttributes } from 'react'

import classnames from 'classnames'

export type BadgeColor = 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | 'neutral'
export type BadgeVariant = 'soft' | 'outlined' | 'filled'
export type BadgeSize = 'sm' | 'md'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  color?: BadgeColor
  variant?: BadgeVariant
  size?: BadgeSize

  /** Prefix a filled status dot — reinforces state without relying on colour
   *  alone, which matters for the ~8% of users with colour-vision deficiency. */
  dot?: boolean
}

/* Soft variants pair a tint with that family's ink so the label clears 4.5:1
   on the tint. Filled variants are verified label-against-fill; `secondary`
   uses the dark step because white on mid-gold only reaches 4.0:1. */
const colorClasses: Record<BadgeColor, Record<BadgeVariant, string>> = {
  primary: {
    soft: 'bg-primary/16 text-primaryInk',
    outlined: 'border border-borderControl text-primaryInk',
    filled: 'bg-primary text-richBlack'
  },
  secondary: {
    soft: 'bg-secondary/14 text-secondaryDark',
    outlined: 'border border-borderControl text-secondaryDark',
    filled: 'bg-secondaryDark text-white'
  },
  error: {
    soft: 'bg-error/14 text-errorDark',
    outlined: 'border border-error/50 text-errorDark',
    filled: 'bg-error text-white'
  },
  success: {
    soft: 'bg-success/14 text-successDark',
    outlined: 'border border-success/50 text-successDark',
    filled: 'bg-success text-white'
  },
  warning: {
    soft: 'bg-warning/18 text-warningInk',
    outlined: 'border border-warning/55 text-warningInk',
    filled: 'bg-warning text-richBlack'
  },
  info: {
    soft: 'bg-info/14 text-infoDark',
    outlined: 'border border-info/50 text-infoDark',
    filled: 'bg-info text-white'
  },
  neutral: {
    soft: 'bg-textSecondary/14 text-textSecondary',
    outlined: 'border border-borderControl text-textSecondary',
    filled: 'bg-textSecondary text-white'
  }
}

const dotClasses: Record<BadgeColor, string> = {
  primary: 'bg-primaryDark',
  secondary: 'bg-secondaryDark',
  error: 'bg-error',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  neutral: 'bg-textSecondary'
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'h-5 gap-1 px-1.5 text-2xs',
  md: 'h-6 gap-1.5 px-2 text-xs'
}

/** Status pill. Fixed height per size keeps a column of badges optically
 *  aligned; medium weight and normal tracking read as a label rather than the
 *  shouty uppercase-wide-tracked chip it replaces. */
const Badge = ({
  color = 'neutral',
  variant = 'soft',
  size = 'md',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) => (
  <span
    className={classnames(
      'inline-flex max-w-full shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap',
      sizeClasses[size],
      colorClasses[color][variant],
      className
    )}
    {...props}
  >
    {dot && <span aria-hidden className={classnames('size-1.5 shrink-0 rounded-full', dotClasses[color])} />}
    <span className='truncate'>{children}</span>
  </span>
)

export default Badge
