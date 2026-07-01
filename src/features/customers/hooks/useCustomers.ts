'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { customersApi } from '../api/customersApi'
import type { AdminUserListParams, UserTier } from '../types'

export const customerKeys = {
  all: ['customers'] as const,
  list: (params: AdminUserListParams) => [...customerKeys.all, 'list', params] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const
}

export const useCustomers = (params: AdminUserListParams) =>
  useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customersApi.list(params),
    placeholderData: keepPreviousData
  })

export const useCustomer = (id: string | undefined) =>
  useQuery({
    queryKey: customerKeys.detail(id ?? ''),
    queryFn: () => customersApi.detail(id as string),
    enabled: !!id
  })

export const useUpdateCustomerTier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, tier }: { id: string; tier: UserTier }) => customersApi.updateTier(id, tier),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all })
  })
}

export const useDeactivateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => customersApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all })
  })
}
