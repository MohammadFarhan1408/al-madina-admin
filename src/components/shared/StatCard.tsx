import classnames from 'classnames'

import Card from '@/components/ui/Card'

export type StatCardColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'

type StatCardProps = {
  title: string
  value: string | number
  icon: string
  color?: StatCardColor
  subtitle?: string
}

const accentClasses: Record<StatCardColor, string> = {
  primary: 'border-b-primary/40 hover:border-b-primary',
  secondary: 'border-b-secondary/40 hover:border-b-secondary',
  error: 'border-b-error/40 hover:border-b-error',
  warning: 'border-b-warning/40 hover:border-b-warning',
  info: 'border-b-info/40 hover:border-b-info',
  success: 'border-b-success/40 hover:border-b-success'
}

const iconClasses: Record<StatCardColor, string> = {
  primary: 'bg-primary/15 text-primaryDark',
  secondary: 'bg-secondary/15 text-secondaryDark',
  error: 'bg-error/15 text-error',
  warning: 'bg-warning/15 text-warningDark',
  info: 'bg-info/15 text-info',
  success: 'bg-success/15 text-success'
}

/** Compact KPI card used on the dashboard. */
const StatCard = ({ title, value, icon, color = 'primary', subtitle }: StatCardProps) => (
  <Card className={classnames('border-b-2 transition-[border-color,box-shadow] hover:shadow-lg', accentClasses[color])}>
    <div className='flex items-center gap-4 p-4'>
      <span className={classnames('flex size-11 shrink-0 items-center justify-center rounded-md', iconClasses[color])}>
        <i className={classnames(icon, 'text-[26px]')} />
      </span>
      <div className='flex flex-col'>
        <span className='text-xl font-semibold text-textPrimary'>{value}</span>
        <span className='text-sm text-textSecondary'>{title}</span>
        {subtitle && <span className='text-xs text-textDisabled'>{subtitle}</span>}
      </div>
    </div>
  </Card>
)

export default StatCard
