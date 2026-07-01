'use client'

import { useQuery } from '@tanstack/react-query'

import { dashboardApi } from '../api/dashboardApi'

export const dashboardKeys = {
  overview: ['dashboard', 'overview'] as const,
  orderStats: ['dashboard', 'order-stats'] as const
}

export const useDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.overview,
    queryFn: dashboardApi.overview
  })

export const useOrderStats = () =>
  useQuery({
    queryKey: dashboardKeys.orderStats,
    queryFn: dashboardApi.orderStats
  })
