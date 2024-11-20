import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import sendResponse from '../../../shared/sendResponse'
import { organizerFilterField } from './organizer.constant'
import { organizerServices } from './organizer.service'
import { IReqUser } from '../../interfaces/common'

const getOrganizers = catchAsync(async (req, res) => {
  const filters = pick(req.query, organizerFilterField)
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])

  const result = await organizerServices.getAllOrganizer(filters, options)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organizers data fetched!',
    data: result.data,
    meta: result.meta,
  })
})

const getSingleOrganizer = catchAsync(async (req, res) => {
  const result = await organizerServices.getSingleOrganizer(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organizer data fetched!',
    data: result,
  })
})

const updateSingleOrganizer = catchAsync(async (req, res) => {
  const result = await organizerServices.updateOrganizer(
    req.params.id,
    req.body,
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organizer data updated!',
    data: result,
  })
})

const getOrganizerStat = catchAsync(async (req, res) => {
  const result = await organizerServices.getOrganizerStat(
    (req.user as IReqUser).email,
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organizer Statistics fetched!',
    data: result,
  })
})

const getMyEvents = catchAsync(async (req, res) => {
  const result = await organizerServices.getMyEvents(
    (req.user as IReqUser).email,
    req.query,
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event Data fetched!',
    data: result,
  })
})

const deleteSingleOrganizer = catchAsync(async (req, res) => {
  const result = await organizerServices.softDeleteOrganizer(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organizer data deleted!',
    data: result,
  })
})

export const organizerController = {
  getOrganizers,
  getSingleOrganizer,
  updateSingleOrganizer,
  deleteSingleOrganizer,
  getOrganizerStat,
  getMyEvents,
}
