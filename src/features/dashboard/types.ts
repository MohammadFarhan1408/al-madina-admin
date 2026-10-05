// Dashboard aggregate types (doc §7.12 — GET /admin/dashboard, /admin/orders/stats).
import type { Order, OrderStatus } from '../orders/types'

export type RevenueBreakdown = {
  today: number
  week: number
  month: number
}

export type OrderStatusCounts = Record<OrderStatus, number>

export type TopProduct = {
  id?: string
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

export type Granularity = 'day' | 'month'

export type SummaryPoint = { date: string; revenue: number; orders: number; newCustomers: number }

export type SummaryTotals = { revenue: number; orders: number; aov: number; newCustomers: number }

/** Shape of `GET /admin/dashboard/summary` — mirrors adminService.dashboardSummary(). */
export type DashboardSummary = {
  range: { from: string; to: string; granularity: Granularity }
  totals: SummaryTotals
  previous: SummaryTotals
  series: SummaryPoint[]
  ordersByStatus: Partial<OrderStatusCounts>
  topProducts: TopProduct[]
}
