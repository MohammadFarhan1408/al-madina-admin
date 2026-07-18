'use client'

// A single label/value line inside a DetailSection. `value` accepts any
// node so callers can render a StatusChip, a list, an image, etc. — not
// just plain text.
import type { ReactNode } from 'react'

import Typography from '@mui/material/Typography'

type DetailRowProps = {
  label: string
  value: ReactNode

  /** Stack label above value instead of side-by-side — for longer content (addresses, descriptions). */
  stacked?: boolean
}

export const DetailRow = ({ label, value, stacked }: DetailRowProps) => (
  <div className={stacked ? 'flex flex-col gap-1' : 'flex items-center justify-between gap-4'}>
    <Typography variant='body2' color='text.secondary'>
      {label}
    </Typography>
    {typeof value === 'string' || typeof value === 'number' ? (
      <Typography variant='body2' className={stacked ? undefined : 'text-end'}>
        {value}
      </Typography>
    ) : (
      value
    )}
  </div>
)

export default DetailRow
