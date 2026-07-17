// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'tabler-layout-dashboard'
  },
  {
    label: 'Catalogue',
    isSection: true,
    children: [
      {
        label: 'Products',
        href: '/products',
        icon: 'tabler-package'
      },
      {
        label: 'Categories',
        href: '/categories',
        icon: 'tabler-category'
      },
      {
        label: 'Collections',
        href: '/collections',
        icon: 'tabler-stack-2'
      },
      {
        label: 'Tags',
        href: '/tags',
        icon: 'tabler-tags'
      }
    ]
  },
  {
    label: 'Commerce',
    isSection: true,
    children: [
      {
        label: 'Orders',
        href: '/orders',
        icon: 'tabler-shopping-cart'
      },
      {
        label: 'Customers',
        href: '/customers',
        icon: 'tabler-users'
      },
      {
        label: 'Reviews',
        href: '/reviews',
        icon: 'tabler-star'
      },
      {
        label: 'Coupons',
        href: '/coupons',
        icon: 'tabler-discount'
      }
    ]
  },
  {
    label: 'Engagement',
    isSection: true,
    children: [
      {
        label: 'Notifications',
        href: '/notifications',
        icon: 'tabler-bell'
      }
    ]
  },
  {
    label: 'Administration',
    isSection: true,
    children: [
      {
        label: 'Roles & Permissions',
        href: '/roles',
        icon: 'tabler-shield-lock'
      }
    ]
  }
]

export default verticalMenuData
