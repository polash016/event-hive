import { Category } from '@prisma/client'
import prisma from '../../../shared/prisma'
import AppError from '../../errors/AppError'
import httpStatus from 'http-status'

const getAllCategories = async () => {
  const result = await prisma.category.findMany({})

  const total = await prisma.category.count({})

  return {
    meta: {
      total,
    },
    data: result,
  }
}

const createCategory = async (data: {
  name: string
}): Promise<Category | null> => {
  const category = await prisma.category.findFirst({
    where: {
      name: {
        contains: data.name,
        mode: 'insensitive',
      },
    },
  })
  if (category) {
    throw new AppError(httpStatus.CONFLICT, 'Category already exists')
  }
  const result = await prisma.category.create({
    data,
  })

  return result
}

const deleteCategory = async (id: string) => {
  const result = await prisma.category.delete({
    where: {
      id,
    },
  })

  return result
}

export const categoryServices = {
  getAllCategories,
  createCategory,
  deleteCategory,
}
