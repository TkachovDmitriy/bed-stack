import { z } from 'zod'

export interface ApiResponse<T> {
  data: T
}

export function paginatedResponse<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    data: z.array(schema),
    meta: z.object({
      total:      z.number(),
      page:       z.number(),
      perPage:    z.number(),
      nextCursor: z.string().optional(),
    }),
  })
}

export type PaginatedMeta = {
  total:      number
  page:       number
  perPage:    number
  nextCursor?: string
}
