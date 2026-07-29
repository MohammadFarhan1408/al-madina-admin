'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import classnames from 'classnames'

import Sidebar from '@/components/ui/Sidebar'
import Navbar from '@/components/ui/Navbar'
import Logo from '@/components/layout/shared/Logo'
import NavbarSearch from '@/components/layout/shared/NavbarSearch'
import UserDropdown from '@/components/layout/shared/UserDropdown'
import sidebarNavData from '@/data/navigation/sidebarNavData'

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type='button'
      aria-label='Scroll to top'
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={classnames(
        'fixed bottom-6 right-6 z-50 flex size-10 items-center justify-center rounded-full bg-primary text-black shadow-lg transition-opacity',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <i className='tabler-arrow-up text-lg' />
    </button>
  )
}

const DashboardShell = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className='min-h-screen bg-backgroundDefault'>
      <Sidebar sections={sidebarNavData} open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} logo={<Link href='/dashboard'><Logo /></Link>} />

      {sidebarOpen && (
        <div className='fixed inset-0 z-30 bg-backdrop lg:hidden' onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      <div className='flex min-h-screen flex-col lg:pl-64'>
        <Navbar
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          actions={
            <>
              <NavbarSearch className='hidden w-full max-w-[320px] sm:block' />
              <UserDropdown />
            </>
          }
        />
        <main className='flex-1 p-6'>{children}</main>
        <footer className='flex flex-wrap items-center justify-between gap-4 border-t border-secondary/20 px-6 py-4 text-sm'>
          <p>
            <span className='text-textSecondary'>{`© ${new Date().getFullYear()} `}</span>
            <span className='font-medium text-primary'>Al Madina Ittar</span>
            <span className='text-textSecondary'>{` · Admin Panel`}</span>
          </p>
          <p className='text-textSecondary max-md:hidden'>Luxury Arabian Perfumery</p>
        </footer>
      </div>

      <ScrollToTopButton />
    </div>
  )
}

export default DashboardShell
