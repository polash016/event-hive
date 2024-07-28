import { Gender, UserStatus } from '@prisma/client'
import { z } from 'zod'

const createAdmin = z.object({
  password: z.string({ required_error: 'Password is required' }).min(6),
  admin: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }).email(),
    contactNumber: z.string({ required_error: 'Contact Number is required' }),
  }),
})

const GenderEnum = z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHERS])

const createOrganizer = z.object({
  password: z.string({ required_error: 'Password is required' }).min(6),
  organizer: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }).email(),
    profilePhoto: z.string().url().optional(),
    contactNumber: z.string({ required_error: 'Contact Number is required' }),
    address: z.string().optional(),
    organizationName: z.string({
      required_error: 'Organization Name is required',
    }),
    gender: GenderEnum,
    websiteUrl: z
      .string({
        required_error: 'Website Url is required',
      })
      .optional(),
    socialMediaUrl: z
      .string({ required_error: 'SocialMedia Url is required' })
      .optional(),
  }),
})

const createAttendee = z.object({
  password: z.string({ required_error: 'Password is required' }).min(6),
  attendee: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }).email(),
    contactNumber: z.string({ required_error: 'Contact Number is required' }),
    address: z.string().optional(),
    gender: GenderEnum,
  }),
})

const updateProfileStatus = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED]),
  }),
})

export const userValidation = {
  createAdmin,
  createOrganizer,
  createAttendee,
  updateProfileStatus,
}
