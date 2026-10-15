'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { activityApi } from '../api/activityApi'
import type { ActivityParams } from '../types'

export const useActivity = (params: ActivityParams) =>
  useQuery({
    queryKey: ['activity', 'list', params] as const,
    queryFn: () => activityApi.list(params),
    placeholderData: keepPreviousData
  })
