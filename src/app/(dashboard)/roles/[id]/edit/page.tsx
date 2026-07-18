import type { Metadata } from 'next'

import EditRoleView from '@views/roles/EditRoleView'

export const metadata: Metadata = {
  title: 'Edit Role — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const EditRolePage = async ({ params }: Props) => {
  const { id } = await params

  return <EditRoleView id={id} />
}

export default EditRolePage
