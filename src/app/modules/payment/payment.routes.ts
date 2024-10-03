import express from 'express'
import { paymentController } from './payment.controller'
import auth from '../../middlewares/auth'
import { UserRole } from '@prisma/client'
const router = express.Router()

router.post(
  '/init/:eventId',
  auth(UserRole.ATTENDEE),
  paymentController.initPayment,
)

router.post('/ipn', auth(UserRole.ATTENDEE), paymentController.validatePayment)

router.post(
  '/create-checkout-session/:eventId',
  auth(UserRole.ATTENDEE),
  paymentController.checkoutPaymentSession,
)

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook,
)

export const PaymentRoutes = router
