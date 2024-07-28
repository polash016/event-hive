import { Request, Response } from 'express'
import { userService } from './user.service'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { userSearchableField } from './user.const'
import pick from '../../../shared/pick'

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin Created successfully!',
    data: result,
  })
})

const createOrganizer = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createOrganizer(req)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organizer Created successfully!',
    data: result,
  })
})

const createAttendee = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createAttendee(req)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendee Created successfully!',
    data: result,
  })
})

const getAllUsers = catchAsync(async (req, res) => {
  const filters = pick(req.query, userSearchableField)
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  console.log(req.query, { filters }, options)

  const result = await userService.getAllUsers(filters, options)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User data fetched!',
    data: result.data,
    meta: result.meta,
  })
})

const changeProfileStatus = catchAsync(async (req, res) => {
  const { id } = req.params

  const result = await userService.changeStatus(id, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Status Changed',
    data: result.data,
  })
})

const getMyProfile = catchAsync(async (req, res) => {
  const result = await userService.getProfile(req.user)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  })
})

const updateMyProfile = catchAsync(async (req, res) => {
  const result = await userService.updateProfile(req.user, req)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  })
})

export const userController = {
  createAdmin,
  createOrganizer,
  createAttendee,
  getAllUsers,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
}
