'use client'

// Derives a breadcrumb trail from the sidebar's own section grouping
// (Catalogue/Commerce/Engagement) and the current route, so navigation
// structure isn't duplicated in a second place. Activates the
// @core/theme/overrides/breadcrumbs.ts styling, previously unused.
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

import MuiBreadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'

import verticalMenuData from '@/data/navigation/verticalMenuData'
import type { VerticalMenuDataType, VerticalSectionDataType, VerticalMenuItemDataType } from '@/types/menuTypes'

export type Crumb = { label: ReactNode; href?: string }

const isSection = (item: VerticalMenuDataType): item is VerticalSectionDataType => 'isSection' in item && Boolean(item.isSection)
const isLeaf = (item: VerticalMenuDataType): item is VerticalMenuItemDataType => 'href' in item

const matches = (pathname: string, href?: string) => Boolean(href) && (pathname === href || pathname.startsWith(`${href}/`))

function findTrail(pathname: string): Crumb[] {
  const menu = verticalMenuData()

  for (const item of menu) {
    if (isLeaf(item) && matches(pathname, item.href)) {
      return item.href === '/dashboard'
        ? [{ label: item.label, href: item.href }]
        : [{ label: 'Dashboard', href: '/dashboard' }, { label: item.label, href: item.href }]
    }

    if (isSection(item)) {
      const child = item.children.filter(isLeaf).find(c => matches(pathname, c.href))

      if (child) {
        return [{ label: 'Dashboard', href: '/dashboard' }, { label: item.label }, { label: child.label, href: child.href }]
      }
    }
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
    <MuiBreadcrumbs className='mbe-2' separator={<i className='tabler-chevron-right text-[14px]' />}>
      {trail.map((crumb, index) => {
        const isLast = index === trail.length - 1

        if (crumb.href && !isLast) {
          return (
            <NextLink key={index} href={crumb.href}>
              {crumb.label}
            </NextLink>
          )
        }

        return (
          <Typography key={index} variant='body2' color={isLast ? 'text.primary' : 'text.secondary'}>
            {crumb.label}
          </Typography>
        )
      })}
    </MuiBreadcrumbs>
  )
}

export default Breadcrumbs
