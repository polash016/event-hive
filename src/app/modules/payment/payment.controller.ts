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

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment validated successfully',
    data: result,
  })
})

const checkoutPaymentSession = catchAsync(async (req, res) => {
  const { eventId } = req.body
  const email = (req?.user as IReqUser)?.email

  const result = await paymentService.checkoutPaymentSession(eventId, email)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment initiated successfully',
    data: result,
  })
})

const paymentSuccess = catchAsync(async (req, res) => {
  const result = await paymentService.handleSuccessfulPayment(
    req.body,
    (req?.user as IReqUser)?.email,
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment Completed successfully',
    data: result,
  })
})

const getAllPayments = catchAsync(async (req, res) => {
  const result = await paymentService.getMyPayments(
    (req.user as IReqUser).email,
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event data fetched!',
    data: result,
  })
})

export const paymentController = {
  initPayment,
  validatePayment,
  checkoutPaymentSession,
  paymentSuccess,
  getAllPayments,
}
