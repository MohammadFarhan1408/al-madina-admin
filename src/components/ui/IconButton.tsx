'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

import Spinner from './Spinner'

export type IconButtonVariant = 'ghost' | 'subtle' | 'outlined' | 'filled'
export type IconButtonColor = 'default' | 'primary' | 'error' | 'success' | 'inverse'
export type IconButtonSize = 'sm' | 'md' | 'lg'

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  'aria-label': string
  variant?: IconButtonVariant
  color?: IconButtonColor
  size?: IconButtonSize
  loading?: boolean
  rounded?: boolean
  children: ReactNode
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'size-7 text-[16px]',
  md: 'size-9 text-[18px]',
  lg: 'size-10 text-[20px]'
}

const spinnerSize: Record<IconButtonSize, 'sm' | 'md'> = { sm: 'sm', md: 'sm', lg: 'md' }

const colorClasses: Record<IconButtonColor, Record<IconButtonVariant, string>> = {
  default: {
    ghost: 'text-textSecondary hover:bg-actionHover hover:text-textPrimary active:bg-actionSelected',
    subtle: 'bg-actionHover text-textSecondary hover:bg-actionSelected hover:text-textPrimary',
    outlined:
      'border border-borderControl text-textSecondary hover:border-borderStrong hover:bg-actionHover hover:text-textPrimary',
    filled: 'bg-textSecondary text-white hover:bg-textPrimary'
  },
  primary: {
    ghost: 'text-primaryInk hover:bg-primary/12 active:bg-primary/20',
    subtle: 'bg-primary/12 text-primaryInk hover:bg-primary/20',
    outlined: 'border border-borderControl text-primaryInk hover:border-primary hover:bg-primary/12',
    filled: 'bg-primary text-richBlack shadow-primarySm hover:bg-primaryDark hover:text-white'
  },
  error: {
    ghost: 'text-error hover:bg-error/12 active:bg-error/20',
    subtle: 'bg-error/12 text-error hover:bg-error/20',
    outlined: 'border border-error/50 text-error hover:border-error hover:bg-error/12',
    filled: 'bg-error text-white hover:bg-errorDark'
  },
  success: {
    ghost: 'text-success hover:bg-success/12 active:bg-success/20',
    subtle: 'bg-success/12 text-success hover:bg-success/20',
    outlined: 'border border-success/50 text-success hover:border-success hover:bg-success/12',
    filled: 'bg-success text-white hover:bg-successDark'
  },
  inverse: {
    ghost: 'text-ivoryDim hover:bg-white/10 hover:text-ivory active:bg-white/15',
    subtle: 'bg-white/10 text-ivoryDim hover:bg-white/15 hover:text-ivory',
    outlined: 'border border-primary/35 text-ivoryDim hover:border-primary hover:bg-white/10 hover:text-ivory',
    filled: 'bg-primary text-richBlack hover:bg-primaryLight'
  }
}

/** Square icon-only button. Replaces the ad-hoc `rounded p-1 hover:bg-black/5`
 *  buttons that each list view, dialog and toolbar was re-inventing at a
 *  slightly different size, radius and hover treatment.
 *
 *  On coarse pointers the hit area is expanded to 44×44 by a pseudo-element,
 *  so touch targets meet the minimum without inflating the visual size or
 *  disturbing the surrounding layout. */
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'ghost',
      color = 'default',
      size = 'md',
      loading = false,
      rounded = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type='button'
      disabled={disabled || loading}
      className={classnames(
        'relative inline-flex shrink-0 items-center justify-center transition-[color,background-color,border-color,box-shadow]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-45',

        // Expand the touch target without changing the painted box.
        "pointer-coarse:after:absolute pointer-coarse:after:left-1/2 pointer-coarse:after:top-1/2 pointer-coarse:after:size-11 pointer-coarse:after:-translate-x-1/2 pointer-coarse:after:-translate-y-1/2 pointer-coarse:after:content-['']",
        rounded ? 'rounded-full' : 'rounded-sm',
        sizeClasses[size],
        colorClasses[color][variant],
        className
      )}
      {...props}
    >
      {loading ? <Spinner size={spinnerSize[size]} /> : children}
    </button>
  )
)

IconButton.displayName = 'IconButton'

export default IconButton
