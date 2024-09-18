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

export const paymentController = {
  initPayment,
  validatePayment,
}
