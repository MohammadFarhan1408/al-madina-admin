import type { ReactNode } from 'react'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'Al Madina Ittar — Admin Panel',
  description: 'Administration panel for the Al Madina Ittar luxury perfume storefront.'
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang='en'>
    <body className='flex min-h-full w-full flex-auto flex-col bg-backgroundDefault text-textPrimary'>{children}</body>
  </html>
)

export default RootLayout
