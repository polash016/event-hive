/* eslint-disable @typescript-eslint/no-explicit-any */

import { Event, Prisma, UserStatus } from '@prisma/client'
import calculatePagination from '../../../helpers/paginationHelper'
import { TPaginationOptions } from '../../interfaces/pagination'
import { TEventFilterRequest } from './event.interface'
import { eventSearchFields } from './event.constant'
import prisma from '../../../shared/prisma'

const getAllEvent = async (
  params: TEventFilterRequest,
  options: TPaginationOptions,
) => {
  const { limit, page, skip } = calculatePagination(options)
  const andConditions: Prisma.EventWhereInput[] = []

  const { searchTerm, ...filterData } = params

  if (searchTerm) {
    andConditions.push({
      OR: eventSearchFields.map(field => ({
        [field]: {
          contains: params.searchTerm,
          mode: 'insensitive',
        },
      })),
    })
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    })
  }

  andConditions.push({
    isDeleted: false,
  })

  const whereConditions: Prisma.EventWhereInput = { AND: andConditions }
  const result = await prisma.event.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: 'desc',
          },
  })

  const total = await prisma.event.count({ where: whereConditions })

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const getSingleEvent = async (id: string): Promise<Event | null> => {
  const result = await prisma.event.findUniqueOrThrow({
    where: {
      id: id,
      isDeleted: false,
    },
  })

  return result
}

const updateEvent = async (
  id: string,
  payload: Partial<Event>,
): Promise<Event | null> => {
  const result = await prisma.event.update({
    where: {
      id: id,
      isDeleted: false,
    },
    data: payload,
  })

  return result
}

const deleteEvent = async (id: string) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  })

  const result = await prisma.$transaction(async trans => {
    const adminDelete = await trans.admin.delete({
      where: {
        id: id,
      },
    })

    await trans.user.delete({
      where: {
        email: adminDelete.email,
      },
    })

    return adminDelete
  })

  return result
}

const softDeleteEvent = async (id: string) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  })

  const result = await prisma.$transaction(async trans => {
    const adminDelete = await trans.admin.update({
      where: {
        id: id,
      },
      data: { isDeleted: true },
    })

    await trans.user.update({
      where: {
        email: adminDelete.email,
      },
      data: { status: UserStatus.DELETED },
    })

    return adminDelete
  })

  return result
}

export const eventServices = {
  getAllEvent,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  softDeleteEvent,
}
