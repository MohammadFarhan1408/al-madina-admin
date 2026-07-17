import type { Metadata } from 'next'

import RolesView from '@views/roles/RolesView'

export const metadata: Metadata = {
  title: 'Roles & Permissions — Al Madina Admin'
}

const RolesPage = () => <RolesView />

export default RolesPage
