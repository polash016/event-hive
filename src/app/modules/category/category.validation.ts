import { z } from 'zod'

const updateOrganizer = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
})

export const OrganizerValidation = {
  updateOrganizer,
}
