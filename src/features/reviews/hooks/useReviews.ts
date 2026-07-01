'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { reviewsApi } from '../api/reviewsApi'
import type { AdminReviewListParams } from '../types'

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (params: AdminReviewListParams) => [...reviewKeys.all, 'list', params] as const
}

export const useReviews = (params: AdminReviewListParams) =>
  useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => reviewsApi.list(params),
    placeholderData: keepPreviousData
  })

export const useDeleteReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.all })
  })
}
