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
const StatCard = ({ title, value, icon, color = 'primary', subtitle }: StatCardProps) => (
  <Card hoverable>
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
        {subtitle && <span className='truncate text-xs text-textMuted'>{subtitle}</span>}
      </div>
    </div>
  </Card>
)

/** Loading twin of StatCard — identical box model, so the grid doesn't reflow
 *  when the real numbers arrive. */
export const StatCardSkeleton = () => (
  <Card>
    <div className='flex items-start gap-3.5 px-4 py-4'>
      <Skeleton variant='block' className='size-10' />
      <div className='flex flex-1 flex-col gap-1.5 pt-0.5'>
        <Skeleton className='h-5 w-24' />
        <Skeleton className='h-3.5 w-32' />
      </div>
    </div>
  </Card>
)

export default StatCard
