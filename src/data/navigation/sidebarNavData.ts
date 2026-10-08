import type { SidebarNavItem, SidebarSection } from '@/components/ui/Sidebar'

/** `adminOnly` items are hidden from managers (the API refuses them too). */
type NavItem = SidebarNavItem & { adminOnly?: boolean }
type NavSection = Omit<SidebarSection, 'items'> & { items: NavItem[] }

const sidebarNavData: NavSection[] = [
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
  },
  {
    title: 'System',
    items: [{ label: 'Activity', href: '/activity', icon: 'tabler-history', adminOnly: true }]
  }
]

export const visibleNav = (isAdmin: boolean): NavSection[] =>
  sidebarNavData
    .map(section => ({ ...section, items: section.items.filter(item => isAdmin || !item.adminOnly) }))
    .filter(section => section.items.length > 0)

export default sidebarNavData
