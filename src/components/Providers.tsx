import type { ReactNode } from 'react'

import QueryProvider from '@/components/query/QueryProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'

const Providers = ({ children }: { children: ReactNode }) => (
  <QueryProvider>
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  </QueryProvider>
)

export default Providers
