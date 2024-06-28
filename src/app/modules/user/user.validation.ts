import { Gender, UserStatus } from '@prisma/client';
import {z} from 'zod'

const createAdmin = z.object({
    password: z.string({required_error: 'Password is required'}).min(6),
    admin: z.object({
      name: z.string({required_error: 'Name is required'}),
      email: z.string({required_error: 'Email is required'}).email(),
      contactNumber: z.string({required_error: 'Contact Number is required'}),
    })
})

const GenderEnum = z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]);


const createDoctor  = z.object({
  password: z.string({required_error: 'Password is required'}).min(6),
  doctor: z.object({
    name: z.string({required_error: 'Name is required'}),
  email: z.string({required_error: 'Email is required'}).email(),
  profilePhoto: z.string().url().optional(),
  contactNumber: z.string({required_error: 'Contact Number is required'}),
  address: z.string().optional(),
  registrationNumber: z.string({required_error: 'Registration Number is required'}),
  experience: z.number().int().nonnegative().optional(),
  gender: GenderEnum,
  appointmentFee: z.number({required_error: 'Appointment Fee is required'}).int().nonnegative(),
  qualification: z.string({required_error: 'Qualification is required'}),
  currentWorkingPlace: z.string({required_error: 'Current Working Place is required'}),
  designation: z.string({required_error: 'Designation is required'}),
  averageRating: z.number().min(0).max(5).default(0),
  })
  
});



const createPatient = z.object({
  password: z.string({required_error: 'Password is required'}).min(6),
  admin: z.object({
    name: z.string({required_error: 'Name is required'}),
    email: z.string({required_error: 'Email is required'}).email(),
    contactNumber: z.string({required_error: 'Contact Number is required'}),
    address: z.string().optional(),
  })
})

const updateProfileStatus = z.object({
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED])
})


export const userValidation = {
    createAdmin,
    createDoctor,
    createPatient,
    updateProfileStatus
}