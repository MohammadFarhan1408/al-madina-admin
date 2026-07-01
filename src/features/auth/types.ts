// Auth & User domain types (doc §5.1, §6).

export type UserRole = 'user' | 'manager' | 'admin'
export type UserTier = 'Member' | 'Connoisseur' | 'Maison Elite'

/** User document as serialized by the API (no passwordHash, `id` not `_id`). */
export type User = {
  id: string
  fullName: string
  email: string
  avatar?: string
  role: UserRole
  tier: UserTier
  memberSince: string
  isEmailVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Payload returned by sign-in / sign-up / refresh. */
export type AuthResult = {
  user: User
  accessToken: string
  refreshToken: string
}

/** Roles permitted to use the admin panel. */
export const ADMIN_ROLES: UserRole[] = ['admin', 'manager']

export const isAdminRole = (role?: UserRole) => !!role && ADMIN_ROLES.includes(role)
