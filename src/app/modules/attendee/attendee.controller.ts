import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import sendResponse from '../../../shared/sendResponse'
import { attendeeFilterField } from './attendee.constant'
import { attendeeServices } from './attendee.service'

const getAttendee = catchAsync(async (req, res) => {
  const filters = pick(req.query, attendeeFilterField)
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])

  console.log(req.user)

  const result = await attendeeServices.getAllAttendee(filters, options)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendee data fetched!',
    data: result.data,
    meta: result.meta,
  })
})
const getSingleAttendee = catchAsync(async (req, res) => {
  const result = await attendeeServices.getSingleAttendee(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendee data fetched!',
    data: result,
  })
})

const updateSingleAttendee = catchAsync(async (req, res) => {
  const result = await attendeeServices.updateAttendee(req.params.id, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendee data updated!',
    data: result,
  })
})

const deleteSingleAttendee = catchAsync(async (req, res) => {
  const result = await attendeeServices.softDeleteAttendee(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin data deleted!',
    data: result,
  })
})

export const attendeeController = {
  getAttendee,
  getSingleAttendee,
  updateSingleAttendee,
  deleteSingleAttendee,
}
