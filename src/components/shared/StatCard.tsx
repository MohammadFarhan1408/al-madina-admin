import type { ReactNode } from 'react'

import classnames from 'classnames'

import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

export type StatCardColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'

type StatCardProps = {
  title: string
  value: string | number
  icon: string
  color?: StatCardColor
  subtitle?: string

  /** Change vs the previous period: `change` is a fraction (0.12 = +12%), null
   *  when there is no prior value to compare with. */
  trend?: { change: number | null; caption: string }

  /** Optional small trend graphic (e.g. a sparkline) along the card's foot. */
  chart?: ReactNode
}

/** Fractional change, or null when the baseline is zero. */
export const changeBetween = (current: number, previous: number) => (previous ? (current - previous) / previous : null)

type TrendDirection = 'up' | 'down' | 'flat'

const trendClasses: Record<TrendDirection, string> = {
  up: 'text-successDark',
  down: 'text-errorDark',
  flat: 'text-textMuted'
}

const trendIcons: Record<TrendDirection, string> = {
  up: 'tabler-trending-up',
  down: 'tabler-trending-down',
  flat: 'tabler-minus'
}

const trendWords: Record<TrendDirection, string> = { up: 'Up', down: 'Down', flat: 'Unchanged' }

const TrendLine = ({ change, caption }: NonNullable<StatCardProps['trend']>) => {
  if (change === null) return <span className='truncate text-xs text-textMuted'>No prior data to compare</span>

  const pct = Math.abs(change * 100).toFixed(1)
  const direction = pct === '0.0' ? 'flat' : change > 0 ? 'up' : 'down'

  // Arrow + sign + text: direction never relies on colour alone.
  return (
    <span className={classnames('flex items-center gap-1 truncate text-xs', trendClasses[direction])}>
      <i aria-hidden className={classnames(trendIcons[direction], 'shrink-0 text-sm')} />
      <span className='sr-only'>{trendWords[direction]}</span>
      <span className='font-medium tabular-nums'>
        {direction === 'up' ? '+' : direction === 'down' ? '−' : '±'}
        {pct}%
      </span>
      <span className='truncate text-textMuted'>vs {caption}</span>
    </span>
  )
}

/* Icon tints pair each family's soft background with its ink, so the glyph
   clears 4.5:1 on the tint — mid-gold and mid-amber do not. */
const iconClasses: Record<StatCardColor, string> = {
  primary: 'bg-primary/16 text-primaryInk',
  secondary: 'bg-secondary/14 text-secondaryDark',
  error: 'bg-error/14 text-errorDark',
  warning: 'bg-warning/18 text-warningInk',
  info: 'bg-info/14 text-infoDark',
  success: 'bg-success/14 text-successDark'
}

/** Compact KPI card. The value leads at the largest size on the card because
 *  it's what the user came for; the label sits under it in muted text.
 *
 *  Tabular figures (set globally on `body`) keep a row of these optically
 *  aligned as the numbers change. */
const StatCard = ({ title, value, icon, color = 'primary', subtitle, trend, chart }: StatCardProps) => (
  <Card hoverable className='flex min-w-0 flex-col'>
    <div className='flex items-start gap-3.5 px-4 py-4'>
      <span
        aria-hidden
        className={classnames('flex size-10 shrink-0 items-center justify-center rounded-md', iconClasses[color])}
      >
        <i className={classnames(icon, 'text-[20px]')} />
      </span>
      <div className='flex min-w-0 flex-col gap-0.5'>
        <span className='truncate text-xl font-semibold tracking-[-0.01em] text-textPrimary'>{value}</span>
        <span className='truncate text-sm text-textSecondary'>{title}</span>
        {trend ? (
          <TrendLine {...trend} />
        ) : (
          subtitle && <span className='truncate text-xs text-textMuted'>{subtitle}</span>
        )}
      </div>
    </div>
    {chart && <div className='mt-auto px-4 pb-3'>{chart}</div>}
  </Card>
)

/** Loading twin of StatCard — identical box model, so the grid doesn't reflow
 *  when the real numbers arrive. */
export const StatCardSkeleton = ({ chartHeight }: { chartHeight?: number }) => (
  <Card>
    <div className='flex items-start gap-3.5 px-4 py-4'>
      <Skeleton variant='block' className='size-10' />
      <div className='flex flex-1 flex-col gap-1.5 pt-0.5'>
        <Skeleton className='h-5 w-24' />
        <Skeleton className='h-3.5 w-32' />
        <Skeleton className='h-3 w-40' />
      </div>
    </div>
    {chartHeight && (
      <div className='px-4 pb-3'>
        <Skeleton variant='block' style={{ height: chartHeight }} />
      </div>
    )}
  </Card>
)

export default StatCard
