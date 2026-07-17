// Customer (User) domain types for the admin (doc §5.1, §7.12).
import type { User, UserTier } from '@/features/auth/types'
import type { Order } from '@/features/orders/types'

export type { UserTier }

export const USER_TIERS: UserTier[] = ['Member', 'Connoisseur', 'Maison Elite']

/** A customer is a User row; the admin list reuses the User shape. */
export type Customer = User

/** Read-only — admin views a customer's saved address book, doesn't manage it. */
export type CustomerAddress = {
  id: string
  label?: string
  fullName: string
  phone: string
  addressLine: string
  country: string
  state?: string
  city: string
  postalCode?: string
  landmark?: string
  isDefault: boolean
}

/** Read-only — admin views a customer's current cart, doesn't manage it. */
export type CustomerCartItem = {
  productId: { id: string; name: string; images: string[]; price: number; currency: string } | string
  quantity: number
  volumeMl: number
}

/** `GET /admin/users/:id` returns the customer plus recent orders, addresses, and cart. */
export type CustomerDetail = {
  user: Customer
  recentOrders: Order[]
  addresses: CustomerAddress[]
  cart: CustomerCartItem[]
}

export type AdminUserListParams = {
  page?: number
  limit?: number
  tier?: UserTier
  q?: string
  sortBy?: 'fullName' | 'email' | 'tier' | 'memberSince'
  sortOrder?: 'asc' | 'desc'
}
