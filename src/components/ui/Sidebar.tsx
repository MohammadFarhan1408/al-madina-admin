'use client'

import type { ReactNode } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import classnames from 'classnames'

export type SidebarNavItem = {
  label: string
  href: string
  icon?: string
}

export type SidebarSection = {
  title?: string
  items: SidebarNavItem[]
}

export type SidebarProps = {
  sections: SidebarSection[]
  logo?: ReactNode
  open?: boolean
  onNavigate?: () => void
}

// Fixed dark obsidian + gold sidebar — the "semi-dark" half of the brand's
// light-content/dark-nav Art Deco look, no longer switchable.
const Sidebar = ({ sections, logo, open = true, onNavigate }: SidebarProps) => {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <aside
      className={classnames(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-richBlack text-ivory transition-transform lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {logo && <div className='flex h-14 items-center border-b border-primary/20 px-4'>{logo}</div>}
      <nav className='flex-1 overflow-y-auto px-3 py-4'>
        {sections.map((section, i) => (
          <div key={section.title ?? i} className={classnames(i > 0 && 'mt-6')}>
            {section.title && (
              <div className='px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-ivory/40'>{section.title}</div>
            )}
            <ul className='flex flex-col gap-0.5'>
              {section.items.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={classnames(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive(item.href) ? 'bg-primary/15 font-medium text-primary' : 'text-ivory/80 hover:bg-primary/10 hover:text-ivory'
                    )}
                  >
                    {item.icon && <i className={classnames(item.icon, 'text-lg')} />}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
