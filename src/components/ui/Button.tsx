'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

import Spinner from './Spinner'

/** `filled` = primary action, `soft` = tinted secondary action, `outlined` =
 *  bordered secondary, `text` = tertiary/ghost. Colour is a separate axis, so
 *  "danger" is `color='error'` and "ghost" is `variant='text'`. */
export type ButtonVariant = 'filled' | 'soft' | 'outlined' | 'text'
export type ButtonColor = 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm'
}

const gapClasses: Record<ButtonSize, string> = {
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2'
}

/* Every `text-*` here is an ink token, never the raw fill: gold at 1.9:1 and
   amber at 2.5:1 are unreadable as label text on an ivory surface. Filled
   variants are checked the other way round — the label against the fill. */
const colorClasses: Record<ButtonColor, Record<ButtonVariant, string>> = {
  primary: {
    filled:
      'bg-primary text-richBlack shadow-primarySm hover:bg-primaryLight hover:shadow-primaryMd active:bg-primaryDark active:text-white',
    soft: 'bg-primary/14 text-primaryInk hover:bg-primary/22 active:bg-primary/30',
    outlined:
      'border border-borderControl text-primaryInk hover:border-primary hover:bg-primary/12 active:bg-primary/20',
    text: 'text-primaryInk hover:bg-primary/12 active:bg-primary/20'
  },
  secondary: {
    filled: 'bg-secondaryDark text-white hover:bg-primaryInk active:bg-secondaryDark',
    soft: 'bg-secondary/14 text-secondaryDark hover:bg-secondary/22 active:bg-secondary/30',
    outlined:
      'border border-borderControl text-secondaryDark hover:border-borderStrong hover:bg-secondary/10 active:bg-secondary/18',
    text: 'text-secondaryDark hover:bg-secondary/12 active:bg-secondary/20'
  },
  error: {
    filled: 'bg-error text-white hover:bg-errorDark active:bg-errorDark',
    soft: 'bg-error/12 text-errorDark hover:bg-error/20 active:bg-error/28',
    outlined: 'border border-error/55 text-error hover:border-error hover:bg-error/10 active:bg-error/18',
    text: 'text-error hover:bg-error/10 active:bg-error/18'
  },
  success: {
    filled: 'bg-success text-white hover:bg-successDark active:bg-successDark',
    soft: 'bg-success/12 text-successDark hover:bg-success/20 active:bg-success/28',
    outlined: 'border border-success/55 text-success hover:border-success hover:bg-success/10 active:bg-success/18',
    text: 'text-success hover:bg-success/10 active:bg-success/18'
  },
  warning: {
    filled: 'bg-warning text-richBlack hover:bg-warningInk hover:text-white active:bg-warningDark active:text-white',
    soft: 'bg-warning/16 text-warningInk hover:bg-warning/26 active:bg-warning/34',
    outlined: 'border border-warning/55 text-warningInk hover:border-warning hover:bg-warning/14 active:bg-warning/22',
    text: 'text-warningInk hover:bg-warning/14 active:bg-warning/22'
  },
  info: {
    filled: 'bg-info text-white hover:bg-infoDark active:bg-infoDark',
    soft: 'bg-info/12 text-infoDark hover:bg-info/20 active:bg-info/28',
    outlined: 'border border-info/55 text-info hover:border-info hover:bg-info/10 active:bg-info/18',
    text: 'text-info hover:bg-info/10 active:bg-info/18'
  }
}

const ringClasses: Record<ButtonColor, string> = {
  primary: 'focus-visible:ring-primary/60',
  secondary: 'focus-visible:ring-secondary/60',
  error: 'focus-visible:ring-error/50',
  success: 'focus-visible:ring-success/50',
  warning: 'focus-visible:ring-warning/60',
  info: 'focus-visible:ring-info/50'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'filled',
      color = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      startIcon,
      endIcon,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classnames(
        'relative inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium',
        'transition-[color,background-color,border-color,box-shadow] duration-150 ease-out-quart',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none',
        sizeClasses[size],
        colorClasses[color][variant],
        ringClasses[color],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {/* Loading swaps the label for a centred spinner while keeping the label
          in the layout (invisible), so the button never changes width or
          nudges the buttons beside it. */}
      {loading && (
        <span className='absolute inset-0 flex items-center justify-center'>
          <Spinner size={size === 'lg' ? 'md' : 'sm'} tone='current' />
        </span>
      )}
      <span className={classnames('inline-flex items-center', gapClasses[size], loading && 'invisible')}>
        {startIcon}
        {children}
        {endIcon}
      </span>
    </button>
  )
)

Button.displayName = 'Button'

export default Button
