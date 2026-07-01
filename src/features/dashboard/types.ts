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

/** Shape of `GET /admin/dashboard`. Fields are defensive/optional since the
 *  backend aggregation may evolve; the UI degrades gracefully. */
export type DashboardData = {
  revenue: RevenueBreakdown
  ordersByStatus: OrderStatusCounts
  productCount: number
  customerCount: number
  recentOrders: Order[]
  topProducts: TopProduct[]
}

/** Shape of `GET /admin/orders/stats`. */
export type OrderStats = {
  byStatus: OrderStatusCounts
  totalRevenue: number
  totalOrders: number
}
