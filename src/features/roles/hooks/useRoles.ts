'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { rolesApi } from '../api/rolesApi'
import type { RoleFormValues } from '../schema'

export const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
  detail: (id: string) => [...roleKeys.all, 'detail', id] as const,
  permissions: ['permissions'] as const
}

export const useRoles = () =>
  useQuery({
    queryKey: roleKeys.list(),
    queryFn: rolesApi.list,
    staleTime: 5 * 60_000
  })

export const useRole = (id: string | undefined) =>
  useQuery({
    queryKey: roleKeys.detail(id ?? ''),
    queryFn: () => rolesApi.detail(id as string),
    enabled: !!id
  })

export const usePermissions = () =>
  useQuery({
    queryKey: roleKeys.permissions,
    queryFn: rolesApi.listPermissions,
    staleTime: 60 * 60_000 // seed-defined, effectively static
  })

export const useCreateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: RoleFormValues) => rolesApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roleKeys.all })
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<RoleFormValues> }) => rolesApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roleKeys.all })
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roleKeys.all })
  })
}
