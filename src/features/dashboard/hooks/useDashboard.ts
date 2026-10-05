'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { dashboardApi } from '../api/dashboardApi'
import type { Granularity } from '../types'

export const dashboardKeys = {
  overview: ['dashboard', 'overview'] as const,
  orderStats: ['dashboard', 'order-stats'] as const
}

export const useDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.overview,
    queryFn: dashboardApi.overview
  })

export const useDashboardSummary = (range: { from: string; to: string; granularity: Granularity } | null) =>
  useQuery({
    queryKey: ['dashboard', 'summary', range] as const,
    queryFn: () => dashboardApi.summary(range!),
    enabled: range !== null,
    placeholderData: keepPreviousData
  })

export const useOrderStats = () =>
  useQuery({
    queryKey: dashboardKeys.orderStats,
    queryFn: dashboardApi.orderStats
  })
