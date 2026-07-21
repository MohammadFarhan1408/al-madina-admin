// Order domain types (doc §5.7, §7.6, §7.12).

export const ORDER_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type DeliveryMethod = 'standard' | 'express'
export type PaymentMethod = 'card' | 'wallet' | 'cod'

export const PAYMENT_STATUSES = ['pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export type TransactionStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'

export type Transaction = {
  id: string
  provider: 'cod' | 'simulated'
  status: TransactionStatus
  amount: number
  currency: string
  providerReference?: string
  failureReason?: string
  createdAt: string
}

export type ShippingAddress = {
  fullName: string
  phone: string
  address: string
  city: string
}

export type OrderItem = {
  productId: string
  productName: string
  productImage?: string
  price: number
  quantity: number
  volumeMl: number
}

export type Order = {
  id: string
  reference: string
  userId?: string | null
  guestEmail?: string
  status: OrderStatus
  shippingAddress: ShippingAddress
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  currency: string
  couponCode?: string
  discountAmount?: number
  placedAt: string
  createdAt: string
  updatedAt: string
}

/** Filters for `GET /admin/orders` (doc §7.12). */
export type AdminOrderListParams = {
  page?: number
  limit?: number
  status?: OrderStatus
  from?: string
  to?: string
  sortBy?: 'reference' | 'placedAt' | 'total' | 'status'
  sortOrder?: 'asc' | 'desc'
}
