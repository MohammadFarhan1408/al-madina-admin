// Categories service (doc §7.3 public read + §7.12 admin CRUD).
import { apiDelete, apiGet, apiPatch, apiPost } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'

import type { Category } from '../types'
import type { CategoryFormValues } from '../schema'

export const categoriesApi = {
  // Public list endpoint returns all categories (cached 24h server-side).
  list: () => apiGet<Category[]>(endpoints.categories.list),

  detail: (id: string) => apiGet<Category>(endpoints.categories.detail(id)),

  create: (body: CategoryFormValues) => apiPost<Category>(endpoints.admin.categories, body),

  update: (id: string, body: Partial<CategoryFormValues>) => apiPatch<Category>(endpoints.admin.category(id), body),

  remove: (id: string) => apiDelete<{ success: boolean }>(endpoints.admin.category(id))
}
