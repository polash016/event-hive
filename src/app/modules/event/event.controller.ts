import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import sendResponse from '../../../shared/sendResponse'
import { eventFilterField } from './event.constant'
import { eventServices } from './event.service'

const createEvent = catchAsync(async (req, res) => {
  const result = await eventServices.createEvent(req)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event Created successfully!',
    data: result,
  })
})

const getAllEvent = catchAsync(async (req, res) => {
  const filters = pick(req.query, eventFilterField)
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])

  const result = await eventServices.getAllEvent(
    filters,
    options,
    req?.user?.email,
  )

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
  const result = await eventServices.updateEvent(req.params.id, req)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event data updated!',
    data: result,
  })
})

const deleteEvent = catchAsync(async (req, res) => {
  const result = await eventServices.deleteEvent(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event data deleted!',
    data: result,
  })
})

export const eventController = {
  createEvent,
  getAllEvent,
  getSingleEvent,
  updateEvent,
  deleteEvent,
}
