// Chart colors pulled from the brand's @theme tokens (src/app/globals.css)
// rather than new arbitrary hex values, so charts stay in the same palette
// as every badge/chip on the page.
import type { OrderStatus } from '@/features/orders/types'

export const CHART_COLORS = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
  success: 'var(--color-success)'
} as const

// Mirrors StatusChip's COLOR_MAP for order statuses exactly, so a status's
// chart bar and its StatusChip badge are always the same color.
export const ORDER_STATUS_CHART_COLORS: Record<OrderStatus, string> = {
  processing: CHART_COLORS.warning,
  shipped: CHART_COLORS.info,
  delivered: CHART_COLORS.success,
  cancelled: CHART_COLORS.error
}
