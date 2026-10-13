'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { contactApi } from '../api/contactApi'
import type { ContactParams } from '../types'

export const useContactMessages = (params: ContactParams) =>
  useQuery({
    queryKey: ['contact', 'list', params] as const,
    queryFn: () => contactApi.list(params),
    placeholderData: keepPreviousData
  })
