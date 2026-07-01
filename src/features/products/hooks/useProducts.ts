'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { productsApi } from '../api/productsApi'
import type { ProductListParams } from '../types'
import type { ProductFormValues } from '../schema'

export const productKeys = {
  all: ['products'] as const,
  list: (params: ProductListParams) => [...productKeys.all, 'list', params] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const
}

export const useProducts = (params: ProductListParams) =>
  useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.list(params),
    placeholderData: keepPreviousData
  })

export const useProduct = (id: string | undefined) =>
  useQuery({
    queryKey: productKeys.detail(id ?? ''),
    queryFn: () => productsApi.detail(id as string),
    enabled: !!id
  })

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ProductFormValues) => productsApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all })
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ProductFormValues> }) => productsApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all })
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all })
  })
}
