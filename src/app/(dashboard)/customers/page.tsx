import type { Metadata } from 'next'

import CustomersView from '@views/customers/CustomersView'

export const metadata: Metadata = {
  title: 'Customers — Al Madina Admin'
}

const CustomersPage = () => <CustomersView />

export default CustomersPage
