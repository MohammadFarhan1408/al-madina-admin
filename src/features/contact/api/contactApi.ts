import { apiGet } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'
import type { Paginated } from '@/libs/api/types'

import type { ContactMessage, ContactParams } from '../types'

export const contactApi = {
  list: (params: ContactParams) => apiGet<Paginated<ContactMessage>>(endpoints.admin.contact, { params })
}
