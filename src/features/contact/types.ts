// Contact form submissions from the storefront (GET /admin/contact), newest first.
export type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
}

export type ContactParams = {
  page?: number
  limit?: number
}
