import { apiDelete, apiGet, apiPatch, apiPost } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'

import type { Tag } from '../types'
import type { TagFormValues } from '../schema'

export const tagsApi = {
  list: () => apiGet<Tag[]>(endpoints.tags.list),

  detail: (id: string) => apiGet<Tag>(endpoints.tags.detail(id)),

  create: (body: TagFormValues) => apiPost<Tag>(endpoints.admin.tags, body),

  update: (id: string, body: TagFormValues) => apiPatch<Tag>(endpoints.admin.tag(id), body),

  remove: (id: string) => apiDelete<{ success: boolean }>(endpoints.admin.tag(id))
}
