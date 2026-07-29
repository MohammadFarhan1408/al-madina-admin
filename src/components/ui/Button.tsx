'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

import Spinner from './Spinner'

export type ButtonVariant = 'filled' | 'outlined' | 'text'
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
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2'
}

const colorClasses: Record<ButtonColor, Record<ButtonVariant, string>> = {
  primary: {
    filled: 'bg-primary text-black hover:bg-primaryDark focus-visible:ring-primary/50',
    outlined: 'border border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary/50',
    text: 'text-primary hover:bg-primary/10 focus-visible:ring-primary/50'
  },
  secondary: {
    filled: 'bg-secondary text-white hover:bg-secondaryDark focus-visible:ring-secondary/50',
    outlined: 'border border-secondary text-secondary hover:bg-secondary/10 focus-visible:ring-secondary/50',
    text: 'text-secondary hover:bg-secondary/10 focus-visible:ring-secondary/50'
  },
  error: {
    filled: 'bg-error text-white hover:bg-errorDark focus-visible:ring-error/50',
    outlined: 'border border-error text-error hover:bg-error/10 focus-visible:ring-error/50',
    text: 'text-error hover:bg-error/10 focus-visible:ring-error/50'
  },
  success: {
    filled: 'bg-success text-white hover:brightness-110 focus-visible:ring-success/50',
    outlined: 'border border-success text-success hover:bg-success/10 focus-visible:ring-success/50',
    text: 'text-success hover:bg-success/10 focus-visible:ring-success/50'
  },
  warning: {
    filled: 'bg-warning text-black hover:brightness-110 focus-visible:ring-warning/50',
    outlined: 'border border-warning text-warning hover:bg-warning/10 focus-visible:ring-warning/50',
    text: 'text-warning hover:bg-warning/10 focus-visible:ring-warning/50'
  },
  info: {
    filled: 'bg-info text-white hover:brightness-110 focus-visible:ring-info/50',
    outlined: 'border border-info text-info hover:bg-info/10 focus-visible:ring-info/50',
    text: 'text-info hover:bg-info/10 focus-visible:ring-info/50'
  }
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
      className={classnames(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        sizeClasses[size],
        colorClasses[color][variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? <Spinner size={size === 'lg' ? 'md' : 'sm'} /> : startIcon}
      {children}
      {!loading && endIcon}
    </button>
  )
)

Button.displayName = 'Button'

export default Button
