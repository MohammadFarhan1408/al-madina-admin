import { apiDelete, apiGet, apiPatch, apiPost } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'
import type { Paginated } from '@/libs/api/types'

import type { AdminCouponListParams, Coupon } from '../types'
import type { CouponFormValues } from '../schema'

export const couponsApi = {
  list: (params: AdminCouponListParams) => apiGet<Paginated<Coupon>>(endpoints.admin.coupons, { params }),

  detail: (id: string) => apiGet<Coupon>(endpoints.admin.coupon(id)),

  create: (body: CouponFormValues) => apiPost<Coupon>(endpoints.admin.coupons, body),

  update: (id: string, body: Partial<CouponFormValues>) => apiPatch<Coupon>(endpoints.admin.coupon(id), body),

  remove: (id: string) => apiDelete<{ success: boolean }>(endpoints.admin.coupon(id))
}
