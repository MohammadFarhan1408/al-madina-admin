'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ordersApi } from '../api/ordersApi'
import type { AdminOrderListParams, OrderStatus } from '../types'

export const orderKeys = {
  all: ['orders'] as const,
  list: (params: AdminOrderListParams) => [...orderKeys.all, 'list', params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const
}

export const useOrders = (params: AdminOrderListParams) =>
  useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.list(params),
    placeholderData: keepPreviousData
  })

export const useOrder = (id: string | undefined) =>
  useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: () => ordersApi.detail(id as string),
    enabled: !!id
  })

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all })
  })
}
