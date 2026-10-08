import { apiGet } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'

import type { DashboardData, DashboardSummary, Granularity, OrderStats } from '../types'

export const dashboardApi = {
  overview: () => apiGet<DashboardData>(endpoints.admin.dashboard),
  summary: (params: { from: string; to: string; granularity: Granularity }) =>
    apiGet<DashboardSummary>(endpoints.admin.dashboardSummary, { params }),
  orderStats: () => apiGet<OrderStats>(endpoints.admin.ordersStats)
}
