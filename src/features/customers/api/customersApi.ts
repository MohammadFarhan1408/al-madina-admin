// Customers service (doc §7.12 — admin users).
import { apiDelete, apiGet, apiPatch } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'
import type { Paginated } from '@/libs/api/types'

import type { AdminUserListParams, Customer, CustomerDetail, UserTier } from '../types'

export const customersApi = {
  list: (params: AdminUserListParams) => apiGet<Paginated<Customer>>(endpoints.admin.users, { params }),

  detail: (id: string) => apiGet<CustomerDetail>(endpoints.admin.user(id)),

  updateTier: (id: string, tier: UserTier) => apiPatch<Customer>(endpoints.admin.userTier(id), { tier }),

  deactivate: (id: string) => apiDelete<{ success: boolean }>(endpoints.admin.user(id))
}
