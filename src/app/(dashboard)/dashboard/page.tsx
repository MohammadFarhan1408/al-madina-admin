import type { Metadata } from 'next'

import DashboardView from '@views/dashboard/DashboardView'

export const metadata: Metadata = {
  title: 'Dashboard — Al Madina Admin'
}

const DashboardPage = () => <DashboardView />

export default DashboardPage
