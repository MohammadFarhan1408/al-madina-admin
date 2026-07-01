'use client'

import type { ChipProps } from '@mui/material/Chip'

import CustomChip from '@core/components/mui/Chip'
import { humanize } from '@/libs/format'

type ChipColor = ChipProps['color']

// Central colour mapping for the domain enums used across tables (doc §5, §15).
const COLOR_MAP: Record<string, ChipColor> = {
  // Order status
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',

  // Loyalty tiers
  member: 'secondary',
  connoisseur: 'info',
  'maison elite': 'primary',

  // Product badges
  new: 'success',
  bestseller: 'primary',
  limited: 'warning',
  exclusive: 'error',

  // Generic boolean-ish states
  active: 'success',
  inactive: 'secondary',
  verified: 'success'
}

type StatusChipProps = {
  value?: string | null

  /** Explicit colour override; otherwise derived from the value. */
  color?: ChipColor
} & Omit<ChipProps, 'color' | 'label'>

/** Renders a domain enum (status/tier/badge) as a coloured brand chip. */
const StatusChip = ({ value, color, ...rest }: StatusChipProps) => {
  if (!value) return <>—</>

  const resolved = color ?? COLOR_MAP[value.toLowerCase()] ?? 'secondary'

  return <CustomChip size='small' round='true' variant='tonal' color={resolved} label={humanize(value)} {...rest} />
}

export default StatusChip
