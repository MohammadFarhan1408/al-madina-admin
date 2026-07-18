'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { tagsApi } from '../api/tagsApi'
import type { TagFormValues } from '../schema'

export const tagKeys = {
  all: ['tags'] as const,
  list: () => [...tagKeys.all, 'list'] as const,
  detail: (id: string) => [...tagKeys.all, 'detail', id] as const
}

export const useTags = () =>
  useQuery({
    queryKey: tagKeys.list(),
    queryFn: tagsApi.list,
    staleTime: 5 * 60_000
  })

export const useTag = (id: string | undefined) =>
  useQuery({
    queryKey: tagKeys.detail(id ?? ''),
    queryFn: () => tagsApi.detail(id as string),
    enabled: !!id
  })

export const useCreateTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: TagFormValues) => tagsApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tagKeys.all })
  })
}

export const useUpdateTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TagFormValues }) => tagsApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tagKeys.all })
  })
}

export const useDeleteTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tagsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tagKeys.all })
  })
}
