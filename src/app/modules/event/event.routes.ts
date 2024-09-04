import express, { NextFunction, Request, Response } from 'express'
import { UserRole } from '@prisma/client'
import auth from '../../middlewares/auth'
import { eventController } from './event.controller'
import validateRequest from '../../middlewares/validateRequest'
import { EventValidation } from './event.validation'
import { fileUploader } from '../../../helpers/fileUploader'

const router = express.Router()

router.get(
  '/',
  // auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  eventController.getAllEvent,
)

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  eventController.getSingleEvent,
)
router.delete(
  '/:id',
  // auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANIZER),
  eventController.deleteEvent,
)

router.post(
  '/create-event',
  auth(UserRole.ORGANIZER, UserRole.SUPER_ADMIN),
  fileUploader.upload.fields([
    { name: 'events', maxCount: 10 },
    { name: 'speakerImg', maxCount: 1 },
    { name: 'artistImg', maxCount: 1 },
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data) //EventValidation.createEvent.parse(JSON.parse(req.body.data))
    return eventController.createEvent(req, res, next)
  },
)

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(EventValidation.updateEvent),
  eventController.updateEvent,
)

// router.delete(
//   '/soft/:id',
//   auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
//   eventController.deleteEvent,
// )

export const EventRoutes = router
