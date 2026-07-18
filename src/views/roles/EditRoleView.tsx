'use client'

import { useRouter } from 'next/navigation'

import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
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
        {isError ? (
          <Alert severity='error'>{(error as Error)?.message || 'Failed to load role.'}</Alert>
        ) : (
          <div className='flex justify-center p-8'>
            <CircularProgress />
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: role.name, href: `/roles/${id}` }, { label: 'Edit' }]} />
      <PageHeader title={`Edit ${role.name}`} />
      <RoleForm role={role} onSuccess={() => router.push(`/roles/${id}`)} onCancel={() => router.push(`/roles/${id}`)} />
    </>
  )
}

export default EditRoleView
