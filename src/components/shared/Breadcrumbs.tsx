'use client'

// Derives a breadcrumb trail from the sidebar's own section grouping
// (Catalogue/Commerce/Engagement) and the current route, so navigation
// structure isn't duplicated in a second place.
//
// The nav-derived trail only ever knows about the 3 levels the sidebar
// itself models (Dashboard / Section / Module). Dynamic routes one level
// beyond a module (e.g. /products/[id], /products/[id]/edit) prefix-match
// against the module's own href so the trail still resolves, and the page
// supplies its own trailing crumb(s) via `extra` (e.g. the record's name,
// then "Edit").
import type { ReactNode } from 'react'

import { usePathname } from 'next/navigation'
import NextLink from 'next/link'

import classnames from 'classnames'

import sidebarNavData from '@/data/navigation/sidebarNavData'

export type Crumb = { label: ReactNode; href?: string }

const matches = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`)

function findTrail(pathname: string): Crumb[] {
  for (const section of sidebarNavData) {
    const item = section.items.find(i => matches(pathname, i.href))

    if (!item) continue

    if (item.href === '/dashboard') return [{ label: item.label, href: item.href }]

    return [
      { label: 'Dashboard', href: '/dashboard' },
      ...(section.title ? [{ label: section.title }] : []),
      { label: item.label, href: item.href }
    ]
  }

  return []
}

type BreadcrumbsProps = {

  /** Trailing crumbs appended after the nav-derived trail, e.g. a record's
   *  name on a Detail page, or `[{label: 'Royal Oud', href: '/products/1'}, {label: 'Edit'}]` on its Edit page. */
  extra?: Crumb[]
}

const Breadcrumbs = ({ extra = [] }: BreadcrumbsProps) => {
  const pathname = usePathname()
  const trail = [...findTrail(pathname), ...extra]

  if (trail.length === 0) return null

  return (
    <nav aria-label='Breadcrumb' className='mb-3'>
      <ol className='flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs'>
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1

          return (
            <li key={index} className='flex min-w-0 items-center gap-1'>
              {index > 0 && <i aria-hidden className='tabler-chevron-right shrink-0 text-[13px] text-textDisabled' />}
              {crumb.href && !isLast ? (
                <NextLink
                  href={crumb.href}
                  className='truncate rounded-xs px-0.5 text-textMuted transition-colors hover:text-primaryInk hover:underline hover:underline-offset-2'
                >
                  {crumb.label}
                </NextLink>
              ) : (
                <span

                  // The current page is the accessible endpoint of the trail.
                  aria-current={isLast ? 'page' : undefined}
                  className={classnames('truncate px-0.5', isLast ? 'font-medium text-textPrimary' : 'text-textMuted')}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
