import express from 'express'
import { UserRole } from '@prisma/client'
import auth from '../../middlewares/auth'
import { attendeeController } from './attendee.controller'
import validateRequest from '../../middlewares/validateRequest'
import { AttendeeValidation } from './attendee.validation'

const router = express.Router()

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  attendeeController.getAttendee,
)

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  attendeeController.getSingleAttendee,
)

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(AttendeeValidation.updateAttendee),
  attendeeController.updateSingleAttendee,
)

router.delete(
  '/soft/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  attendeeController.deleteSingleAttendee,
)

export const AttendeeRoutes = router
