'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { collectionsApi } from '../api/collectionsApi'
import type { CollectionFormValues } from '../schema'

export const collectionKeys = {
  all: ['collections'] as const,
  list: () => [...collectionKeys.all, 'list'] as const,
  detail: (id: string) => [...collectionKeys.all, 'detail', id] as const,
  products: (id: string) => [...collectionKeys.all, 'products', id] as const
}

export const useCollections = () =>
  useQuery({
    queryKey: collectionKeys.list(),
    queryFn: collectionsApi.list,
    staleTime: 5 * 60_000
  })

export const useCollection = (id: string | undefined) =>
  useQuery({
    queryKey: collectionKeys.detail(id ?? ''),
    queryFn: () => collectionsApi.detail(id as string),
    enabled: !!id
  })

export const useCollectionProducts = (id: string | undefined) =>
  useQuery({
    queryKey: collectionKeys.products(id ?? ''),
    queryFn: () => collectionsApi.products(id as string),
    enabled: !!id
  })

export const useCreateCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CollectionFormValues) => collectionsApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: collectionKeys.all })
  })
}

export const useUpdateCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CollectionFormValues> }) =>
      collectionsApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: collectionKeys.all })
  })
}

export const useDeleteCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => collectionsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: collectionKeys.all })
  })
}

export const useAddCollectionProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, productId }: { id: string; productId: string }) => collectionsApi.addProduct(id, productId),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.products(id) })
      queryClient.invalidateQueries({ queryKey: collectionKeys.list() })
    }
  })
}

export const useRemoveCollectionProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, productId }: { id: string; productId: string }) => collectionsApi.removeProduct(id, productId),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.products(id) })
      queryClient.invalidateQueries({ queryKey: collectionKeys.list() })
    }
  })
}
