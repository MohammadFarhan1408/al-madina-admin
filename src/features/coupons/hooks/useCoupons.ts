'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { couponsApi } from '../api/couponsApi'
import type { AdminCouponListParams } from '../types'
import type { CouponFormValues } from '../schema'

export const couponKeys = {
  all: ['coupons'] as const,
  list: (params: AdminCouponListParams) => [...couponKeys.all, 'list', params] as const,
  detail: (id: string) => [...couponKeys.all, 'detail', id] as const
}

export const useCoupons = (params: AdminCouponListParams) =>
  useQuery({
    queryKey: couponKeys.list(params),
    queryFn: () => couponsApi.list(params),
    placeholderData: keepPreviousData
  })

export const useCoupon = (id: string | undefined) =>
  useQuery({
    queryKey: couponKeys.detail(id ?? ''),
    queryFn: () => couponsApi.detail(id as string),
    enabled: !!id
  })

export const useCreateCoupon = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CouponFormValues) => couponsApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: couponKeys.all })
  })
}

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CouponFormValues> }) => couponsApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: couponKeys.all })
  })
}

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => couponsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: couponKeys.all })
  })
}
