import express from 'express'
import { authController } from './auth.controller'
import auth from '../../middlewares/auth'
import { UserRole } from '@prisma/client'
import passport from 'passport'

const router = express.Router()

router.post('/login', authController.loginUser)

router.post('/refresh-token', authController.refreshToken)
router.get('/success', authController.googleCallback)

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    // successRedirect: '/api/v1/auth/success',
    failureRedirect: 'http://localhost:3000/login',
  }),
  authController.googleCallback,
)

router.post(
  '/change-password',
  auth(
    UserRole.ATTENDEE,
    UserRole.ORGANIZER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  authController.changePassword,
)

router.post('/forgot-password', authController.forgotPassword)

router.post('/reset-password', authController.resetPassword)

export const AuthRoutes = router
