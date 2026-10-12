import type { ReactNode } from 'react'

import { connection } from 'next/server'
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

// Render per request: the CSP nonce set in src/middleware.ts only reaches Next's
// scripts during a request-time render (a prebuilt static page has no nonce).
const RootLayout = async ({ children }: { children: ReactNode }) => {
  await connection()

  return (
    <html lang='en' className={geist.variable}>
      <body className='flex min-h-full w-full flex-auto flex-col bg-backgroundDefault text-textPrimary'>{children}</body>
    </html>
  )
}

export default RootLayout
