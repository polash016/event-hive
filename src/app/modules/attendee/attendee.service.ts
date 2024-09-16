/* eslint-disable @typescript-eslint/no-explicit-any */

import { Attendee, Prisma } from '@prisma/client'
import calculatePagination from '../../../helpers/paginationHelper'
import { TPaginationOptions } from '../../interfaces/pagination'
import { TAttendeeFilterRequest } from './attendee.interface'
import { attendeeSearchFields } from './attendee.constant'
import prisma from '../../../shared/prisma'

const getAllAttendee = async (
  params: TAttendeeFilterRequest,
  options: TPaginationOptions,
) => {
  const { limit, page, skip } = calculatePagination(options)
  const andConditions: Prisma.AttendeeWhereInput[] = []

  const { searchTerm, ...filterData } = params

  if (searchTerm) {
    andConditions.push({
      OR: attendeeSearchFields.map(field => ({
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

  // andConditions.push({
  //   user: {
  //     payment: {

  //     }
  //   }

  // })

  andConditions.push({
    isDeleted: false,
  })

  const whereConditions: Prisma.AttendeeWhereInput = { AND: andConditions }
  const result = await prisma.attendee.findMany({
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
    include: {
      user: {
        include: {
          payment: {
            include: {
              event: true,
            },
          },
        },
      },
    },
  })

  const total = await prisma.attendee.count({ where: whereConditions })

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const getSingleAttendee = async (id: string): Promise<Attendee | null> => {
  const result = await prisma.attendee.findUniqueOrThrow({
    where: {
      id: id,
      isDeleted: false,
    },
  })

  return result
}

const updateAttendee = async (
  id: string,
  payload: Partial<Attendee>,
): Promise<Attendee | null> => {
  const result = await prisma.attendee.update({
    where: {
      id: id,
      isDeleted: false,
    },
    data: payload,
  })

  return result
}

const softDeleteAttendee = async (id: string) => {
  await prisma.attendee.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  })

  const result = await prisma.$transaction(async trans => {
    const adminDelete = await trans.attendee.delete({
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

export const attendeeServices = {
  getAllAttendee,
  getSingleAttendee,
  updateAttendee,
  softDeleteAttendee,
}
