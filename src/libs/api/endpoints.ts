// Typed API path constants — the single place that maps to backend doc §7.
// Do NOT introduce paths that are not documented in al-madina-ittar-backend.md.

export const endpoints = {
  auth: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
  },

  // Public catalogue reads (used by admin list/detail views).
  products: {
    list: '/products',
    detail: (id: string) => `/products/${id}`,
    reviews: (id: string) => `/products/${id}/reviews`
  },
  categories: {
    list: '/categories',
    detail: (id: string) => `/categories/${id}`,
    products: (id: string) => `/categories/${id}/products`
  },
  collections: {
    list: '/collections',
    detail: (id: string) => `/collections/${id}`,
    products: (id: string) => `/collections/${id}/products`
  },
  orders: {
    detail: (id: string) => `/orders/${id}`
  },
  tags: {
    list: '/tags',
    detail: (id: string) => `/tags/${id}`
  },

  // Admin (role: admin | manager) — audited mutations.
  admin: {
    dashboard: '/admin/dashboard',
    ordersStats: '/admin/orders/stats',
    products: '/admin/products',
    product: (id: string) => `/admin/products/${id}`,
    productImages: (id: string) => `/admin/products/${id}/images`,
    categories: '/admin/categories',
    category: (id: string) => `/admin/categories/${id}`,
    collections: '/admin/collections',
    collection: (id: string) => `/admin/collections/${id}`,
    collectionProducts: (id: string) => `/admin/collections/${id}/products`,
    collectionProduct: (id: string, productId: string) => `/admin/collections/${id}/products/${productId}`,
    orders: '/admin/orders',
    orderStatus: (id: string) => `/admin/orders/${id}/status`,
    users: '/admin/users',
    user: (id: string) => `/admin/users/${id}`,
    userTier: (id: string) => `/admin/users/${id}/tier`,
    reviews: '/admin/reviews',
    review: (id: string) => `/admin/reviews/${id}`,
    notifications: '/admin/notifications',
    upload: '/admin/upload',
    coupons: '/admin/coupons',
    coupon: (id: string) => `/admin/coupons/${id}`,
    roles: '/admin/roles',
    role: (id: string) => `/admin/roles/${id}`,
    permissions: '/admin/permissions',
    tags: '/admin/tags',
    tag: (id: string) => `/admin/tags/${id}`
  }
} as const
