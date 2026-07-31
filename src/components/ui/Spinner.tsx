import classnames from 'classnames'

export type SpinnerSize = 'sm' | 'md' | 'lg'

/** `brand` spins gold on a faint track; `current` inherits the surrounding
 *  text colour, for use inside filled buttons where gold-on-gold would vanish. */
export type SpinnerTone = 'brand' | 'current' | 'inverse'

export type SpinnerProps = {
  size?: SpinnerSize
  tone?: SpinnerTone
  className?: string

  /** Announced by screen readers. Pass `null` when a parent already labels the
   *  loading region, so the same state isn't announced twice. */
  label?: string | null
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-9 border-[3px]'
}

const toneClasses: Record<SpinnerTone, string> = {
  brand: 'border-secondary/20 border-t-primaryDark',
  current: 'border-current/30 border-t-current',
  inverse: 'border-white/25 border-t-white'
}

const Spinner = ({ size = 'md', tone = 'brand', className, label = 'Loading' }: SpinnerProps) => (
  <span
    role={label ? 'status' : undefined}
    aria-label={label ?? undefined}
    aria-hidden={label ? undefined : true}
    className={classnames(
      'inline-block shrink-0 animate-spin rounded-full',
      sizeClasses[size],
      toneClasses[tone],
      className
    )}
  />
)

export default Spinner
