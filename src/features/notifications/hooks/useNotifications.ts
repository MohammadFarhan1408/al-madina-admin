'use client'

import { useMutation } from '@tanstack/react-query'

import { notificationsApi } from '../api/notificationsApi'
import type { BroadcastFormValues } from '../schema'

export const useBroadcastNotification = () =>
  useMutation({
    mutationFn: (values: BroadcastFormValues) => notificationsApi.broadcast(values)
  })
