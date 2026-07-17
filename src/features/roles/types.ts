export type Permission = {
  id: string
  key: string
  module: string
  label: string
}

export type Role = {
  id: string
  name: string
  description?: string
  permissionIds: Permission[] | string[]
  isSystem: boolean
  createdAt: string
  updatedAt: string
}
