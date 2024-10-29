/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { paymentService } from './payment.service'
import { IReqUser } from '../../interfaces/common'

const initPayment = catchAsync(async (req, res) => {
  const { eventId } = req.params
  const email = (req?.user as IReqUser)?.email
  const result = await paymentService.initPayment(eventId, email)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment initiated successfully',
    data: result,
  })
})

const validatePayment = catchAsync(async (req, res) => {
  const result = await paymentService.validatePayment(req.query)

  console.log('validate payment', req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment validated successfully',
    data: result,
  })
})

const checkoutPaymentSession = catchAsync(async (req, res) => {
  const { eventId } = req.params
  const email = (req?.user as IReqUser)?.email
  const result = await paymentService.checkoutPaymentSession(eventId, email)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment initiated successfully',
    data: result,
  })
})

const handleWebhook = catchAsync(async (req, res) => {
  try {
    const event = await paymentService.constructEvent(
      req.body,
      req.headers['stripe-signature'] as string,
    )
    await paymentService.handleWebhookEvent(event)
    res.sendStatus(200)
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    res.status(400).send(`Webhook Error: ${error.message}`)
  }
})

export const paymentController = {
  initPayment,
  validatePayment,
  checkoutPaymentSession,
  handleWebhook,
}
