import { z } from 'zod'

const updateEvent = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
})

export const EventValidation = {
  updateEvent,
}
