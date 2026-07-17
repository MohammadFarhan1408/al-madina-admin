// Coupon domain types (admin-only — no public read endpoint).

export const DISCOUNT_TYPES = ['percentage', 'fixed'] as const
export type DiscountType = (typeof DISCOUNT_TYPES)[number]

export type Coupon = {
  id: string
  code: string
  description: string
  discountType: DiscountType
  value: number
  currency: string
  minPurchase: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  expiresAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminCouponListParams = {
  page?: number
  limit?: number
  isActive?: boolean
}
