'use client'

// TanStack Query provider — one client per browser session.
import { useState, type ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { makeQueryClient } from '@/libs/query/queryClient'

const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => makeQueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default QueryProvider
