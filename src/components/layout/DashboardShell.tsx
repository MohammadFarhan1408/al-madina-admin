'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import classnames from 'classnames'

import Sidebar from '@/components/ui/Sidebar'
import Navbar from '@/components/ui/Navbar'
import IconButton from '@/components/ui/IconButton'
import Logo from '@/components/layout/shared/Logo'
import NavbarSearch from '@/components/layout/shared/NavbarSearch'
import UserDropdown from '@/components/layout/shared/UserDropdown'
import sidebarNavData from '@/data/navigation/sidebarNavData'

const COLLAPSE_KEY = 'am-admin:sidebar-collapsed'

const logoLinkClass =
  'flex items-center rounded-lg p-1 transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70'

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Hidden means hidden: without the tabIndex/aria-hidden pair the button stays
  // in the tab order while invisible, so keyboard users land on a control they
  // cannot see.
  return (
    <IconButton
      color='primary'
      variant='filled'
      size='lg'
      rounded
      aria-label='Scroll to top'
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={classnames(
        'fixed bottom-5 right-5 z-(--z-sticky) shadow-lg transition-[opacity,transform] duration-200 ease-out-quart',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      )}
    >
      <i className='tabler-arrow-up' />
    </IconButton>
  )
}

const DashboardShell = ({ children }: { children: ReactNode }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  // Read the saved rail state after mount — reading localStorage during render
  // would desync the server and client markup.
  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === '1')
  }, [])

  const toggleCollapse = () =>
    setCollapsed(prev => {
      window.localStorage.setItem(COLLAPSE_KEY, prev ? '0' : '1')

      return !prev
    })

  // A route change should always leave the mobile drawer closed, including
  // back/forward navigation that doesn't pass through a nav link's onClick.
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Modal behaviour for the mobile drawer: focus moves in, returns to the
  // opener on close, and the page behind is `inert` (below). Crossing into the
  // desktop layout closes it so a resize can't leave the page inert.
  useEffect(() => {
    if (!drawerOpen) return

    const opener = document.activeElement as HTMLElement | null
    const mq = window.matchMedia('(min-width: 1200px)')
    const onChange = () => mq.matches && setDrawerOpen(false)

    document.querySelector<HTMLElement>('aside button[aria-label="Close navigation"]')?.focus()
    mq.addEventListener('change', onChange)

    return () => {
      mq.removeEventListener('change', onChange)
      opener?.focus()
    }
  }, [drawerOpen])

  // Esc closes the drawer, matching the dismiss behaviour of every other
  // overlay in the admin.
  useEffect(() => {
    if (!drawerOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  return (
    <div className='min-h-dvh bg-backgroundDefault'>
      <a
        href='#main'
        className='sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-toast) focus:rounded-md focus:bg-richBlack focus:px-4 focus:py-2 focus:text-sm focus:text-ivory'
      >
        Skip to content
      </a>
      <Sidebar
        sections={sidebarNavData}
        open={drawerOpen}

        // The rail state is a desktop preference; a collapsed rail opened as a
        // mobile drawer would be a 68px strip of icons over a dimmed page.
        collapsed={collapsed && !drawerOpen}
        onToggleCollapse={toggleCollapse}
        onNavigate={() => setDrawerOpen(false)}
        onClose={() => setDrawerOpen(false)}
        logo={
          <Link href='/dashboard' aria-label='Al Madina Ittar — Dashboard' className={logoLinkClass}>
            <Logo />
          </Link>
        }
      />

      <div
        aria-hidden
        onClick={() => setDrawerOpen(false)}
        className={classnames(
          'fixed inset-0 z-(--z-drawer-backdrop) bg-backdrop backdrop-blur-sm transition-opacity duration-200 ease-out-quart lg:hidden',
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <div
        inert={drawerOpen}
        className={classnames(
          'flex min-h-dvh flex-col transition-[padding] duration-200 ease-out-quart',
          collapsed ? 'lg:pl-(--sidebar-width-collapsed)' : 'lg:pl-(--sidebar-width)'
        )}
      >
        <Navbar onMenuToggle={() => setDrawerOpen(true)} actions={<UserDropdown />}>
          <NavbarSearch className='w-full max-w-72 lg:max-w-80' />
        </Navbar>

        {/* Gutters step up with the viewport instead of sitting at a fixed 24px,
            which is too tight on phones and too cramped on a 27" display. */}
        <main id='main' tabIndex={-1} className='flex-1 focus:outline-none px-4 py-5 md:px-6 md:py-6 xl:px-8'>
          <div className='mx-auto w-full max-w-[1600px]'>{children}</div>
        </main>
      </div>

      <ScrollToTopButton />
    </div>
  )
}

export default DashboardShell
