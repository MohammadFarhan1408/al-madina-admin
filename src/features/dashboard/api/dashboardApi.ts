import { apiGet } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'

import type { DashboardData, OrderStats } from '../types'

export const dashboardApi = {
  overview: () => apiGet<DashboardData>(endpoints.admin.dashboard),
  orderStats: () => apiGet<OrderStats>(endpoints.admin.ordersStats)
}
