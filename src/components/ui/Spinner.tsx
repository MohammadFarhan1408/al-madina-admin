import classnames from 'classnames'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export type SpinnerProps = {
  size?: SpinnerSize
  className?: string
  label?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-10 border-[3px]'
}

const Spinner = ({ size = 'md', className, label = 'Loading' }: SpinnerProps) => (
  <span
    role='status'
    aria-label={label}
    className={classnames(
      'inline-block animate-spin rounded-full border-secondary/20 border-t-primary',
      sizeClasses[size],
      className
    )}
  />
)

export default Spinner
