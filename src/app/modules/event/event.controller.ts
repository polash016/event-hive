import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import sendResponse from '../../../shared/sendResponse'
import { eventFilterField } from './event.constant'
import { eventServices } from './event.service'

const getAllEvent = catchAsync(async (req, res) => {
  const filters = pick(req.query, eventFilterField)
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])

  const result = await eventServices.getAllEvent(filters, options)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event data fetched!',
    data: result.data,
    meta: result.meta,
  })
})
const getSingleEvent = catchAsync(async (req, res) => {
  const result = await eventServices.getSingleEvent(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event data fetched!',
    data: result,
  })
})

const updateEvent = catchAsync(async (req, res) => {
  const result = await eventServices.updateEvent(req.params.id, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event data updated!',
    data: result,
  })
})

const deleteEvent = catchAsync(async (req, res) => {
  const result = await eventServices.softDeleteEvent(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin data deleted!',
    data: result,
  })
})

export const eventController = {
  getAllEvent,
  getSingleEvent,
  updateEvent,
  deleteEvent,
}
