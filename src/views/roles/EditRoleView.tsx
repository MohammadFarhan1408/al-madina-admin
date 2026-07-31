'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import QueryState from '@/components/shared/QueryState'
import RoleForm from '@/features/roles/components/RoleForm'
import { useRole } from '@/features/roles/hooks/useRoles'

type Props = { id: string }

const EditRoleView = ({ id }: Props) => {
  const router = useRouter()
  const { data: role, isLoading, isError, error } = useRole(id)

  if (isLoading || !role) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Edit Role' />
        <QueryState isError={isError} error={error} fallbackMessage='Failed to load role.' />
      </>
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: role.name, href: `/roles/${id}` }, { label: 'Edit' }]} />
      <PageHeader title={`Edit ${role.name}`} />
      <RoleForm
        role={role}
        onSuccess={() => router.push(`/roles/${id}`)}
        onCancel={() => router.push(`/roles/${id}`)}
      />
    </>
  )
}

export default EditRoleView
