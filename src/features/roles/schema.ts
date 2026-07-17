import { z } from 'zod'

export const roleSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  description: z.string().trim().optional(),
  permissionIds: z.array(z.string())
})

export type RoleFormValues = z.infer<typeof roleSchema>

export const defaultRoleValues: RoleFormValues = { name: '', description: '', permissionIds: [] }
