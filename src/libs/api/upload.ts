// Shared image-upload helper. Streams a single file to the admin upload endpoint
// (multipart) and returns the resulting Cloudinary URL (doc §7.12, §13).
import { apiPost } from './axios'
import { endpoints } from './endpoints'

export type UploadType = 'product' | 'avatar' | 'category' | 'collection'

type UploadResponse = string | { url?: string; secureUrl?: string; secure_url?: string }

export async function uploadImage(file: File, type: UploadType): Promise<string> {
  const form = new FormData()

  // Backend accepts the file under `file` for the single-image upload endpoint.
  form.append('file', file)

  const data = await apiPost<UploadResponse>(`${endpoints.admin.upload}?type=${type}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  if (typeof data === 'string') return data

  const url = data.url ?? data.secureUrl ?? data.secure_url

  if (!url) throw new Error('Upload succeeded but no URL was returned')

  return url
}
