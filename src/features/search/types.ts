// Global search (GET /admin/search) — a few matches per kind for the command palette.
export type SearchResults = {
  products: { id: string; name: string; brand: string; image?: string; inStock: boolean }[]
  orders: { id: string; reference: string; status: string; total: number; currency: string; customer?: string }[]
  customers: { id: string; fullName: string; email: string; isActive: boolean }[]
}
