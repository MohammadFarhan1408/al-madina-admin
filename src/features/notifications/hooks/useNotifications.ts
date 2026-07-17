'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { notificationsApi } from '../api/notificationsApi'
import type { BroadcastFormValues } from '../schema'
import type { NotificationHistoryParams } from '../types'

export const notificationKeys = {
  all: ['notifications'] as const,
  history: (params: NotificationHistoryParams) => [...notificationKeys.all, 'history', params] as const
}

export const useBroadcastNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: BroadcastFormValues) => notificationsApi.broadcast(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all })
  })
}

export const useNotificationHistory = (params: NotificationHistoryParams) =>
  useQuery({
    queryKey: notificationKeys.history(params),
    queryFn: () => notificationsApi.history(params),
    placeholderData: keepPreviousData
  })
