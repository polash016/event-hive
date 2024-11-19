import express from 'express'
import { paymentController } from './payment.controller'
import auth from '../../middlewares/auth'
import { UserRole } from '@prisma/client'
const router = express.Router()

router.get(
  '/all-payment',
  auth(UserRole.ATTENDEE),
  paymentController.getAllPayments,
)

router.post(
  '/init/:eventId',
  auth(UserRole.ATTENDEE),
  paymentController.initPayment,
)

router.post('/ipn', paymentController.validatePayment)

router.post(
  '/create-checkout-session',
  auth(UserRole.ATTENDEE),
  paymentController.checkoutPaymentSession,
)

router.post(
  '/payment-success',
  auth(UserRole.ATTENDEE),
  paymentController.paymentSuccess,
)

export const PaymentRoutes = router
