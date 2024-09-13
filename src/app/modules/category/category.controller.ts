import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { categoryServices } from './category.service'

const getCategories = catchAsync(async (req, res) => {
  const result = await categoryServices.getAllCategories()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category data fetched!',
    meta: result?.meta,
    data: result?.data,
  })
})
const createCategory = catchAsync(async (req, res) => {
  const result = await categoryServices.createCategory(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category data created!',
    data: result,
  })
})

const deleteSingleCategory = catchAsync(async (req, res) => {
  const result = await categoryServices.deleteCategory(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category data deleted!',
    data: result,
  })
})

export const categoryController = {
  getCategories,
  createCategory,
  deleteSingleCategory,
}
