// Orders service — admin list/status (doc §7.12) + shared detail (doc §7.6).
import { apiGet, apiPatch, apiPost } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'
import type { Paginated } from '@/libs/api/types'

import type { AdminOrderListParams, Order, OrderStatus, Transaction } from '../types'

export const ordersApi = {
  list: (params: AdminOrderListParams) => apiGet<Paginated<Order>>(endpoints.admin.orders, { params }),

  detail: (id: string) => apiGet<Order>(endpoints.orders.detail(id)),

  updateStatus: (id: string, status: OrderStatus) =>
    apiPatch<Order>(endpoints.admin.orderStatus(id), { status }),

  transactions: (id: string) => apiGet<Transaction[]>(endpoints.admin.orderTransactions(id)),

  refund: (id: string, transactionId: string) =>
    apiPost<Transaction>(endpoints.admin.paymentRefund(id), { transactionId })
}
