import express from 'express'
import { UserRole } from '@prisma/client'
import { organizerController } from './organizer.controller'
import auth from '../../middlewares/auth'
import validateRequest from '../../middlewares/validateRequest'
import { OrganizerValidation } from './organizer.validation'

const router = express.Router()

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  organizerController.getOrganizers,
)

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  organizerController.getSingleOrganizer,
)

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(OrganizerValidation.updateOrganizer),
  organizerController.updateSingleOrganizer,
)

router.delete(
  '/soft/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  organizerController.deleteSingleOrganizer,
)

export const OrganizerRoutes = router
