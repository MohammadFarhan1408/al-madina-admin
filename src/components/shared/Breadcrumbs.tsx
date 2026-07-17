'use client'

// Derives a breadcrumb trail from the sidebar's own section grouping
// (Catalogue/Commerce/Engagement) and the current route, so navigation
// structure isn't duplicated in a second place. Activates the
// @core/theme/overrides/breadcrumbs.ts styling, previously unused.
import type { ReactNode } from 'react'

import { usePathname } from 'next/navigation'
import NextLink from 'next/link'

import MuiBreadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'

import verticalMenuData from '@/data/navigation/verticalMenuData'
import type { VerticalMenuDataType, VerticalSectionDataType, VerticalMenuItemDataType } from '@/types/menuTypes'

type Crumb = { label: ReactNode; href?: string }

const isSection = (item: VerticalMenuDataType): item is VerticalSectionDataType => 'isSection' in item && Boolean(item.isSection)
const isLeaf = (item: VerticalMenuDataType): item is VerticalMenuItemDataType => 'href' in item

function findTrail(pathname: string): Crumb[] {
  const menu = verticalMenuData()

  for (const item of menu) {
    if (isLeaf(item) && item.href === pathname) {
      return item.href === '/dashboard' ? [{ label: item.label }] : [{ label: 'Dashboard', href: '/dashboard' }, { label: item.label }]
    }

    if (isSection(item)) {
      const child = item.children.find(c => isLeaf(c) && c.href === pathname)

      if (child) {
        return [{ label: 'Dashboard', href: '/dashboard' }, { label: item.label }, { label: child.label }]
      }
    }
  }

  return []
}

const Breadcrumbs = () => {
  const pathname = usePathname()
  const trail = findTrail(pathname)

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
