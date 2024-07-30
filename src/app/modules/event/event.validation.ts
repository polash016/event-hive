import { EventStatus } from '@prisma/client'
import { z } from 'zod'

const createEvent = z.object({
  // body: z.object({

  // }),
  name: z.string({ required_error: 'Name is required' }),
  description: z.string().optional(),
  date: z.string({ required_error: 'Date is required' }),
  street: z.string().optional(),
  city: z.string({ required_error: 'City is required' }),
  country: z.string().optional(),
  totalTicket: z.number({ required_error: 'Total Ticket is required' }),
  status: z.enum([
    EventStatus.UPCOMING,
    EventStatus.ONGOING,
    EventStatus.ENDED,
  ]),
})

const updateEvent = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
})

export const EventValidation = {
  updateEvent,
  createEvent,
}
