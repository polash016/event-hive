/* eslint-disable @typescript-eslint/no-explicit-any */
import { Organizer, Prisma, User, UserStatus } from '@prisma/client'
import { TOrganizerFilterRequest } from './organizer.interface'
import { TPaginationOptions } from '../../interfaces/pagination'
import calculatePagination from '../../../helpers/paginationHelper'
import { organizerSearchFields } from './organizer.constant'
import prisma from '../../../shared/prisma'
import { eventSearchFields } from '../event/event.constant'

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

const getOrganizerStat = async (email: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
    },
  })

  const currentMonthStart = new Date()
  currentMonthStart.setDate(1)
  currentMonthStart.setHours(0, 0, 0, 0)

  const currentMonthEnd = new Date(currentMonthStart)
  currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1)
  currentMonthEnd.setHours(0, 0, 0, 0)

  const total = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      paymentStatus: 'success',
      event: {
        organizerId: user.id,
      },
    },
  })

  const currentMonthRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      paymentStatus: 'success',
      event: {
        organizerId: user.id,
      },
      createdAt: {
        gte: currentMonthStart,
        lt: currentMonthEnd,
      },
    },
  })

  const totalSuccessfulTransactions = await prisma.payment.count({
    where: {
      paymentStatus: 'success',
      event: {
        organizerId: user.id,
      },
    },
  })

  const totalTicketSold = await prisma.event.aggregate({
    _sum: {
      ticketSold: true,
    },
    where: {
      organizerId: user.id,
    },
  })

  const data = {
    totalRevenue: total._sum.amount,
    currentMonthRevenue: currentMonthRevenue._sum.amount,
    totalSuccessfulTransactions,
    totalTicketSold: totalTicketSold._sum.ticketSold,
  }

  return data
}

const getMyEvents = async (email: string, query: Record<string, any>) => {
  const andConditions: Prisma.EventWhereInput[] = []

  if (query?.searchTerm) {
    andConditions.push({
      OR: [
        ...eventSearchFields
          .map(field => ({
            [field]: {
              contains: query.searchTerm,
              mode: 'insensitive',
            },
          }))
          .filter(Boolean),
        {
          guest: {
            name: {
              contains: query.searchTerm,
              mode: 'insensitive',
            },
          },
        },

        {
          location: {
            city: {
              contains: query.searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ],
    })
  }

  andConditions.push({
    organizer: {
      email,
    },
  })

  andConditions.push({
    isDeleted: false,
  })

  const whereConditions: Prisma.EventWhereInput = { AND: andConditions }

  const result = await prisma.event.findMany({
    where: {
      ...whereConditions,
      organizer: {
        status: UserStatus.ACTIVE,
      },
    },
    include: {
      images: true,
      location: true,
      guest: true,
      categories: {
        include: {
          category: true,
        },
      },
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
  getOrganizerStat,
  getMyEvents,
}
