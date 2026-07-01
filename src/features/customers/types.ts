// Customer (User) domain types for the admin (doc §5.1, §7.12).
import type { User, UserTier } from '@/features/auth/types'
import type { Order } from '@/features/orders/types'

export type { UserTier }

export const USER_TIERS: UserTier[] = ['Member', 'Connoisseur', 'Maison Elite']

/** A customer is a User row; the admin list reuses the User shape. */
export type Customer = User

/** `GET /admin/users/:id` returns the customer plus their recent orders. */
export type CustomerDetail = {
  user: Customer
  recentOrders: Order[]
}

export type AdminUserListParams = {
  page?: number
  limit?: number
  tier?: UserTier
}
