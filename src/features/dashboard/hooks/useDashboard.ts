'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { ordersApi } from '@/features/orders/api/ordersApi'
import { orderKeys } from '@/features/orders/hooks/useOrders'
import type { AdminOrderListParams } from '@/features/orders/types'
import { productsApi } from '@/features/products/api/productsApi'
import { productKeys } from '@/features/products/hooks/useProducts'
import type { ProductListParams } from '@/features/products/types'

import { dashboardApi } from '../api/dashboardApi'
import type { ResolvedRange } from '../range'

export const dashboardKeys = {
  overview: ['dashboard', 'overview'] as const,
  orderStats: ['dashboard', 'order-stats'] as const,
  summary: (range: ResolvedRange) => ['dashboard', 'summary', range] as const
}

export const useDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.overview,
    queryFn: dashboardApi.overview
  })

export const useDashboardSummary = (range: ResolvedRange) =>
  useQuery({
    queryKey: dashboardKeys.summary(range),
    queryFn: () => dashboardApi.summary(range),
    placeholderData: keepPreviousData
  })

export const useOrderStats = () =>
  useQuery({
    queryKey: dashboardKeys.orderStats,
    queryFn: dashboardApi.orderStats
  })

/** The filters behind each "needs attention" count. Each is exactly the filter
 *  its linked list page applies from the URL, and the count is that list
 *  endpoint's own `total` (fetched at `limit: 1`), so the number on the
 *  dashboard is the number of rows the link opens. */
export const ATTENTION_FILTERS = {
  toFulfil: { status: 'processing' },
  paymentFailed: { status: 'processing', paymentStatus: 'failed' },
  paymentPending: { status: 'processing', paymentStatus: 'pending' }
} as const satisfies Record<string, AdminOrderListParams>

export const OUT_OF_STOCK_FILTER = { inStock: false } as const satisfies ProductListParams

export const useAttentionOrderCounts = () =>
  useQuery({
    queryKey: [...orderKeys.all, 'dashboard-attention'],
    queryFn: async () => {
      const [toFulfil, paymentFailed, paymentPending] = await Promise.all(
        [ATTENTION_FILTERS.toFulfil, ATTENTION_FILTERS.paymentFailed, ATTENTION_FILTERS.paymentPending].map(f =>
          ordersApi.list({ ...f, page: 1, limit: 1 })
        )
      )

      return { toFulfil: toFulfil.total, paymentFailed: paymentFailed.total, paymentPending: paymentPending.total }
    }
  })

/** Out-of-stock products: the count plus the first few, for thumbnails. */
export const useOutOfStockProducts = () =>
  useQuery({
    queryKey: productKeys.list({ ...OUT_OF_STOCK_FILTER, page: 1, limit: 4 }),
    queryFn: () => productsApi.list({ ...OUT_OF_STOCK_FILTER, page: 1, limit: 4 })
  })
