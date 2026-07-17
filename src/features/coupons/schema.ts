import { z } from 'zod'

import { DISCOUNT_TYPES } from './types'

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'Code must be at least 3 characters')
    .max(24, 'Code must be 24 characters or fewer')
    .transform(v => v.toUpperCase()),
  description: z.string().trim().min(2, 'Description is required'),
  discountType: z.enum(DISCOUNT_TYPES),
  value: z.number().min(0, 'Must be 0 or greater'),
  minPurchase: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(0).optional(),
  expiresAt: z.string().min(1, 'Expiry date is required'),
  isActive: z.boolean()
})

export type CouponFormValues = z.infer<typeof couponSchema>

export const defaultCouponValues: CouponFormValues = {
  code: '',
  description: '',
  discountType: 'percentage',
  value: 10,
  minPurchase: undefined,
  maxDiscount: undefined,
  usageLimit: undefined,
  expiresAt: '',
  isActive: true
}
