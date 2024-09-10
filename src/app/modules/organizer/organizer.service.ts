/* eslint-disable @typescript-eslint/no-explicit-any */
import { Organizer, Prisma, User, UserStatus } from '@prisma/client'
import { TOrganizerFilterRequest } from './organizer.interface'
import { TPaginationOptions } from '../../interfaces/pagination'
import calculatePagination from '../../../helpers/paginationHelper'
import { organizerSearchFields } from './organizer.constant'
import prisma from '../../../shared/prisma'

const getAllOrganizer = async (
  params: TOrganizerFilterRequest,
  options: TPaginationOptions,
) => {
  const { limit, page, skip } = calculatePagination(options)
  const andConditions: Prisma.OrganizerWhereInput[] = []

  const { searchTerm, ...filterData } = params

  if (searchTerm) {
    andConditions.push({
      OR: organizerSearchFields.map(field => ({
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

  const whereConditions: Prisma.OrganizerWhereInput = { AND: andConditions }

  const result = await prisma.organizer.findMany({
    where: {
      ...whereConditions,
      user: {
        status: UserStatus.ACTIVE,
      },
    },

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
          event: true,
        },
      },
    },
  })

  const total = await prisma.organizer.count({ where: whereConditions })

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const getSingleOrganizer = async (id: string): Promise<User | null> => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
      status: UserStatus.ACTIVE,
    },
    include: {
      organizer: true,
    },
  })

  return result
}

const updateOrganizer = async (
  id: string,
  payload: Partial<Organizer>,
): Promise<Organizer | null> => {
  const result = await prisma.organizer.update({
    where: {
      id: id,
      isDeleted: false,
    },
    data: payload,
  })

  return result
}

const softDeleteOrganizer = async (id: string) => {
  await prisma.organizer.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  })

  const result = await prisma.$transaction(async trans => {
    const deleteOrganizer = await trans.organizer.delete({
      where: {
        id: id,
      },
    })

    await trans.user.delete({
      where: {
        email: deleteOrganizer.email,
      },
    })

    await trans.event.updateMany({
      where: {
        organizerId: deleteOrganizer.id,
      },
      data: { isDeleted: true },
    })

    return deleteOrganizer
  })

  return result
}

export const organizerServices = {
  getAllOrganizer,
  getSingleOrganizer,
  updateOrganizer,
  softDeleteOrganizer,
}
