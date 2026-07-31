import type { ReactNode } from 'react'

import { Geist } from 'next/font/google'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'Al Madina Ittar — Admin Panel',
  description: 'Administration panel for the Al Madina Ittar luxury perfume storefront.'
}

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang='en' className={geist.variable}>
    <body className='flex min-h-full w-full flex-auto flex-col bg-backgroundDefault text-textPrimary'>{children}</body>
  </html>
)

export default RootLayout
