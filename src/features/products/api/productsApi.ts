// Products service — public reads (doc §7.2) + admin CRUD (doc §7.12).
import { apiDelete, apiGet, apiPatch, apiPost } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'
import type { Paginated } from '@/libs/api/types'

import type { Product, ProductListParams } from '../types'
import type { ProductFormValues } from '../schema'

export const productsApi = {
  list: (params: ProductListParams) => apiGet<Paginated<Product>>(endpoints.products.list, { params }),

  detail: (id: string) => apiGet<Product>(endpoints.products.detail(id)),

  create: (body: ProductFormValues) => apiPost<Product>(endpoints.admin.products, body),

  update: (id: string, body: Partial<ProductFormValues>) => apiPatch<Product>(endpoints.admin.product(id), body),

  remove: (id: string) => apiDelete<{ success: boolean }>(endpoints.admin.product(id))
}
