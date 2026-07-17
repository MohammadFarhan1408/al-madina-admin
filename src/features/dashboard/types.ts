// Dashboard aggregate types (doc §7.12 — GET /admin/dashboard, /admin/orders/stats).
import type { Order, OrderStatus } from '../orders/types'

export type RevenueBreakdown = {
  today: number
  week: number
  month: number
}

export type OrderStatusCounts = Record<OrderStatus, number>

export type TopProduct = {
  productId: string
  name: string
  image?: string
  unitsSold: number
  revenue: number
}

/** Shape of `GET /admin/dashboard` — mirrors adminService.dashboard() exactly:
 *  `revenue` is amounts, `orders` is counts (+ status breakdown), `products`
 *  is catalogue totals, `customers` is a plain count. */
export type DashboardData = {
  revenue: RevenueBreakdown
  orders: RevenueBreakdown & { byStatus: OrderStatusCounts }
  products: { total: number; outOfStock: number }
  customers: number
  recentOrders: Order[]
  topProducts: TopProduct[]
}

/** Shape of `GET /admin/orders/stats`. */
export type OrderStats = {
  byStatus: OrderStatusCounts
  totalRevenue: number
  totalOrders: number
}
