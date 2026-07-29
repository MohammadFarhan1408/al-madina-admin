import type { ReactNode } from 'react'

import Providers from '@/components/Providers'
import DashboardShell from '@/components/layout/DashboardShell'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Providers direction='ltr'>
      <DashboardShell>{children}</DashboardShell>
    </Providers>
  )
}

export default Layout
