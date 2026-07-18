import type { Metadata } from 'next'

import CreateRoleView from '@views/roles/CreateRoleView'

export const metadata: Metadata = {
  title: 'New Role — Al Madina Admin'
}

const NewRolePage = () => <CreateRoleView />

export default NewRolePage
