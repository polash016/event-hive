import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { paymentService } from './payment.service'

const initPayment = catchAsync(async (req, res) => {
  const { eventId } = req.params
  const email = req.user.email
  const result = await paymentService.initPayment(eventId, email)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment initiated successfully',
    data: result,
  })
})

export const paymentController = {
  initPayment,
}
