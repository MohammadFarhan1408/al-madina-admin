import type { HTMLAttributes } from 'react'

import classnames from 'classnames'

export type SkeletonVariant = 'text' | 'block' | 'circle'

export type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: SkeletonVariant
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'h-4 rounded-xs',
  block: 'rounded-md',
  circle: 'rounded-full'
}

/** Single skeleton primitive. Replaces the local `Shimmer` helpers that the
 *  dashboard, the data table and the detail views each defined separately.
 *
 *  Skeletons stand in for content that is about to arrive, so they must match
 *  the shape of what replaces them — pass the same height/width as the real
 *  element to avoid a layout shift when data lands. */
const Skeleton = ({ variant = 'text', className, ...props }: SkeletonProps) => (
  <span
    aria-hidden
    className={classnames('block animate-shimmer bg-secondary/18', variantClasses[variant], className)}
    {...props}
  />
)

export type SkeletonTextProps = {

  /** Number of lines; the last one is shortened so it reads as a paragraph. */
  lines?: number
  className?: string
}

export const SkeletonText = ({ lines = 3, className }: SkeletonTextProps) => (
  <span className={classnames('flex flex-col gap-2', className)}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} className={i === lines - 1 ? 'w-3/5' : 'w-full'} />
    ))}
  </span>
)

export default Skeleton
