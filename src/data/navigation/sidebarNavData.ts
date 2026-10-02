import type { SidebarSection } from '@/components/ui/Sidebar'

const sidebarNavData: SidebarSection[] = [
  {
    items: [{ label: 'Dashboard', href: '/dashboard', icon: 'tabler-layout-dashboard' }]
  },
  {
    title: 'Catalogue',
    items: [
      { label: 'Products', href: '/products', icon: 'tabler-package' },
      { label: 'Categories', href: '/categories', icon: 'tabler-category' },
      { label: 'Collections', href: '/collections', icon: 'tabler-stack-2' },
      { label: 'Tags', href: '/tags', icon: 'tabler-tags' }
    ]
  },
  {
    title: 'Commerce',
    items: [
      { label: 'Orders', href: '/orders', icon: 'tabler-shopping-cart' },
      { label: 'Customers', href: '/customers', icon: 'tabler-users' },
      { label: 'Reviews', href: '/reviews', icon: 'tabler-star' },
      { label: 'Coupons', href: '/coupons', icon: 'tabler-discount' }
    ]
  },
  {
    title: 'Engagement',
    items: [{ label: 'Notifications', href: '/notifications', icon: 'tabler-bell' }]
  }
]

export default sidebarNavData
