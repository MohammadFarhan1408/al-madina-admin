// Orders service — admin list/status (doc §7.12) + shared detail (doc §7.6).
import { apiGet, apiPatch, apiPost } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'
import type { Paginated } from '@/libs/api/types'

import type { AdminOrder, AdminOrderListParams, BulkStatusResult, Order, OrderStatus, Transaction } from '../types'

export const ordersApi = {
  list: (params: AdminOrderListParams) => apiGet<Paginated<Order>>(endpoints.admin.orders, { params }),

  detail: (id: string) => apiGet<AdminOrder>(endpoints.admin.order(id)),

  bulkUpdateStatus: (ids: string[], status: OrderStatus) =>
    apiPatch<BulkStatusResult>(endpoints.admin.ordersBulkStatus, { ids, status }),

  updateStatus: (id: string, status: OrderStatus) => apiPatch<Order>(endpoints.admin.orderStatus(id), { status }),

  transactions: (id: string) => apiGet<Transaction[]>(endpoints.admin.orderTransactions(id)),

  refund: (id: string, transactionId: string) =>
    apiPost<Transaction>(endpoints.admin.paymentRefund(id), { transactionId })
}
