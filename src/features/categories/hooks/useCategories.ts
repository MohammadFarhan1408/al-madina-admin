'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { categoriesApi } from '../api/categoriesApi'
import type { CategoryFormValues } from '../schema'

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const
}

export const useCategories = () =>
  useQuery({
    queryKey: categoryKeys.list(),
    queryFn: categoriesApi.list,
    staleTime: 5 * 60_000
  })

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CategoryFormValues) => categoriesApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all })
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CategoryFormValues> }) => categoriesApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all })
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all })
  })
}
