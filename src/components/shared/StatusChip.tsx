import Badge, { type BadgeColor } from '@/components/ui/Badge'
import { humanize } from '@/libs/format'

// Central colour mapping for the domain enums used across tables (doc §5, §15).
const COLOR_MAP: Record<string, BadgeColor> = {
  // Order status
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',

  // Payment status
  pending: 'warning',
  paid: 'success',
  failed: 'error',
  refunded: 'secondary',

  // Transaction status
  succeeded: 'success',

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
  verified: 'success',

  // Coupon lifecycle (derived, see CouponsView)
  expired: 'error',
  exhausted: 'warning',

  // Product inventory state — distinct from active/inactive (enabled vs disabled)
  'in-stock': 'success',
  'out-of-stock': 'error'
}

type StatusChipProps = {
  value?: string | null

  /** Explicit colour override; otherwise derived from the value. */
  color?: BadgeColor
  className?: string
}

/** Renders a domain enum (status/tier/badge) as a coloured brand chip. */
const StatusChip = ({ value, color, className }: StatusChipProps) => {
  if (!value) return <>—</>

  const resolved = color ?? COLOR_MAP[value.toLowerCase()] ?? 'secondary'

  return (
    <Badge color={resolved} className={className}>
      {humanize(value)}
    </Badge>
  )
}

export default StatusChip
