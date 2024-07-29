import express from 'express'
import { UserRole } from '@prisma/client'
import auth from '../../middlewares/auth'
import { eventController } from './event.controller'
import validateRequest from '../../middlewares/validateRequest'
import { EventValidation } from './event.validation'

const router = express.Router()

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  eventController.getAllEvent,
)

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  eventController.getSingleEvent,
)

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(EventValidation.updateEvent),
  eventController.updateEvent,
)

router.delete(
  '/soft/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  eventController.deleteEvent,
)

export const EventRoutes = router
