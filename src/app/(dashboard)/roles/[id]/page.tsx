import type { Metadata } from 'next'

import RoleDetailView from '@views/roles/RoleDetailView'

export const metadata: Metadata = {
  title: 'Role — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const RoleDetailPage = async ({ params }: Props) => {
  const { id } = await params

  return <RoleDetailView id={id} />
}

export default RoleDetailPage
