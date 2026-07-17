// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'tabler-layout-dashboard'
  },
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
  },
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
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: 'tabler-bell'
  },
  {
    label: 'Roles & Permissions',
    href: '/roles',
    icon: 'tabler-shield-lock'
  }
]

export default horizontalMenuData
