import { apiDelete, apiGet, apiPatch, apiPost } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'

import type { Permission, Role } from '../types'
import type { RoleFormValues } from '../schema'

export const rolesApi = {
  list: () => apiGet<Role[]>(endpoints.admin.roles),

  listPermissions: () => apiGet<Permission[]>(endpoints.admin.permissions),

  create: (body: RoleFormValues) => apiPost<Role>(endpoints.admin.roles, body),

  update: (id: string, body: Partial<RoleFormValues>) => apiPatch<Role>(endpoints.admin.role(id), body),

  remove: (id: string) => apiDelete<{ success: boolean }>(endpoints.admin.role(id))
}
