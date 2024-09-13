import express from 'express'
import { UserRole } from '@prisma/client'
import validateRequest from '../../middlewares/validateRequest'
import { categoryController } from './category.controller'
import { CategoryValidation } from './category.validation'
import auth from '../../middlewares/auth'

const router = express.Router()

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANIZER),
  categoryController.getCategories,
)

router.post(
  '/create-category',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANIZER),
  validateRequest(CategoryValidation.createCategory),
  categoryController.createCategory,
)

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANIZER),
  categoryController.deleteSingleCategory,
)

export const CategoryRoutes = router
