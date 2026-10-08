import { apiGet } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'
import type { Paginated } from '@/libs/api/types'

import type { ActivityEntry, ActivityParams } from '../types'

export const activityApi = {
  list: (params: ActivityParams) => apiGet<Paginated<ActivityEntry>>(endpoints.admin.activity, { params })
}
