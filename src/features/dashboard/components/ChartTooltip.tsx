import { formatBucket } from '@/libs/format'

import { CHART_COLORS } from './constants'

type ChartTooltipProps = {
  active?: boolean
  label?: string | number
  payload?: readonly { value?: unknown }[]

  /** Name of the measure, e.g. "Revenue". */
  name: string
  format: (value: number) => string
}

/** Tooltip body for the dashboard's time charts: the value leads in strong
 *  ink, the measure and period follow in muted text, keyed by a short stroke
 *  of the series colour (a line key, not a box). Text never wears the series
 *  colour. Recharts renders this on hover and on keyboard focus alike. */
const ChartTooltip = ({ active, label, payload, name, format }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null

  return (
    <div className='rounded-md border border-border bg-backgroundPaper px-3 py-2 text-xs shadow-md'>
      <p className='text-textMuted'>{formatBucket(String(label ?? ''))}</p>
      <p className='mt-0.5 flex items-center gap-2'>
        <span aria-hidden className='h-0.5 w-3 rounded-full' style={{ background: CHART_COLORS.primaryInk }} />
        <span className='text-sm font-semibold text-textPrimary'>{format(Number(payload[0].value ?? 0))}</span>
        <span className='text-textSecondary'>{name}</span>
      </p>
    </div>
  )
}

export default ChartTooltip
