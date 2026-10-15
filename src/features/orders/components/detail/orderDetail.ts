import type { AdminOrder, OrderStatus } from '@/features/orders/types'

export const PAYMENT_METHOD_LABELS: Record<AdminOrder['paymentMethod'], string> = {
  card: 'Card',
  wallet: 'Wallet',
  cod: 'Cash on delivery'
}

const FINAL_STATUSES: OrderStatus[] = ['delivered', 'cancelled']

/** What the backend does on each move (orders.service updateStatus) — so the
 *  confirm dialog never promises or hides a customer notification. */
export function statusChangeEffects(order: AdminOrder, next: OrderStatus): string {
  const parts: string[] = []

  if (FINAL_STATUSES.includes(order.status)) parts.push(`This reopens a ${order.status} order.`)
  if (next === 'shipped')
    parts.push('The customer is emailed a shipping update unless they have turned order updates off.')
  if (order.userId) parts.push('The customer gets an in-app notification.')
  else if (next !== 'shipped') parts.push('Guest customers are not notified of this change.')

  if (next === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
    parts.push('The cash-on-delivery payment will be marked as paid.')
  }

  return parts.join(' ')
}
