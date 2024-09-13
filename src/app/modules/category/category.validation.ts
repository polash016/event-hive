import { z } from 'zod'

const createCategory = z.object({
  body: z.object({
    name: z.string(),
  }),
})

export const CategoryValidation = {
  createCategory,
}
