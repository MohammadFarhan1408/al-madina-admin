'use client'

import classnames from 'classnames'

export type RatingProps = {
  value: number
  max?: number

  /** Omit to render a static, non-interactive display. */
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = { sm: 'text-sm', md: 'text-lg' }

const Rating = ({ value, max = 5, onChange, size = 'md', className }: RatingProps) => {
  const stars = Array.from({ length: max }, (_, i) => i + 1)

  return (
    <span
      className={classnames('inline-flex items-center gap-0.5', sizeClasses[size], className)}
      role={onChange ? 'radiogroup' : 'img'}
      aria-label={onChange ? undefined : `${value} out of ${max} stars`}
    >
      {stars.map(star => {
        const filled = star <= value
        const icon = <i className={classnames(filled ? 'tabler-star-filled text-primary' : 'tabler-star text-textDisabled')} />

        if (!onChange) return <span key={star}>{icon}</span>

        return (
          <button
            key={star}
            type='button'
            role='radio'
            aria-checked={star === value}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange(star === value ? 0 : star)}
            className='transition-transform hover:scale-110'
          >
            {icon}
          </button>
        )
      })}
    </span>
  )
}

export default Rating
