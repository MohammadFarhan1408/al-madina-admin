// Collections service — public reads (doc §7.4) + admin CRUD & membership (§7.12).
import { apiDelete, apiGet, apiPatch, apiPost } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'

import type { Collection } from '../types'
import type { CollectionFormValues } from '../schema'
import type { Product } from '@/features/products/types'

export const collectionsApi = {
  list: () => apiGet<Collection[]>(endpoints.collections.list),

  // Doc §7.4 documents this as "Products within a collection" (unlike the
  // categories equivalent, which is explicitly "Paginated") — the backend
  // returns a plain array, not a { items, page, ... } envelope.
  products: (id: string) => apiGet<Product[]>(endpoints.collections.products(id)),

  create: (body: CollectionFormValues) => apiPost<Collection>(endpoints.admin.collections, body),

  update: (id: string, body: Partial<CollectionFormValues>) =>
    apiPatch<Collection>(endpoints.admin.collection(id), body),

  remove: (id: string) => apiDelete<{ success: boolean }>(endpoints.admin.collection(id)),

  addProduct: (id: string, productId: string) =>
    apiPost<Collection>(endpoints.admin.collectionProducts(id), { productId }),

  removeProduct: (id: string, productId: string) =>
    apiDelete<Collection>(endpoints.admin.collectionProduct(id, productId))
}
