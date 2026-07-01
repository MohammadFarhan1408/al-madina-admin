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
    label: 'Notifications',
    href: '/notifications',
    icon: 'tabler-bell'
  }
]

export default horizontalMenuData
