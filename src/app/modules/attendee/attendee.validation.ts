import { z } from 'zod'

const updateAttendee = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
})

export const AttendeeValidation = {
  updateAttendee,
}
