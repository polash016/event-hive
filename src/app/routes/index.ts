import express from 'express'
import { userRoutes } from '../modules/user/user.routes'
import { AdminRoutes } from '../modules/admin/admin.routes'
import { AuthRoutes } from '../modules/auth/auth.routes'
import { EventRoutes } from '../modules/event/event.routes'
import { AttendeeRoutes } from '../modules/attendee/attendee.routes'

const router = express.Router()

const moduleRoutes = [
  {
    path: '/user',
    route: userRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/attendee',
    route: AttendeeRoutes,
  },
  {
    path: '/organizer',
    route: EventRoutes,
  },
  {
    path: '/event',
    route: EventRoutes,
  },
]

moduleRoutes.forEach(route => {
  router.use(route.path, route.route)
})

export default router
