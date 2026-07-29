// A single label/value line inside a DetailSection. `value` accepts any
// node so callers can render a StatusChip, a list, an image, etc. — not
// just plain text.
import type { ReactNode } from 'react'

type DetailRowProps = {
  label: string
  value: ReactNode

  /** Stack label above value instead of side-by-side — for longer content (addresses, descriptions). */
  stacked?: boolean
}

export const DetailRow = ({ label, value, stacked }: DetailRowProps) => (
  <div className={stacked ? 'flex flex-col gap-1' : 'flex items-center justify-between gap-4'}>
    <span className='text-sm text-textSecondary'>{label}</span>
    {typeof value === 'string' || typeof value === 'number' ? (
      <span className={stacked ? 'text-sm' : 'text-sm text-right'}>{value}</span>
    ) : (
      value
    )}
  </div>
)

export default DetailRow
