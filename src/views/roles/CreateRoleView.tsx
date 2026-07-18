'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import RoleForm from '@/features/roles/components/RoleForm'

const CreateRoleView = () => {
  const router = useRouter()

  return (
    <>
      <Breadcrumbs extra={[{ label: 'New Role' }]} />
      <PageHeader title='New Role' subtitle='Define a new admin role and its permission set' />
      <RoleForm onSuccess={role => router.push(`/roles/${role.id}`)} onCancel={() => router.push('/roles')} />
    </>
  )
}

export default CreateRoleView
