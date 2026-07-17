import { z } from 'zod'

export const tagSchema = z.object({
  name: z.string().trim().min(2, 'Name is required')
})

export type TagFormValues = z.infer<typeof tagSchema>

export const defaultTagValues: TagFormValues = { name: '' }
