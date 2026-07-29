import type { ReactNode } from 'react'

import Providers from '@/components/Providers'

const Layout = ({ children }: { children: ReactNode }) => (
  <Providers direction='ltr'>
    <div className='h-full w-full'>{children}</div>
  </Providers>
)

export default Layout
