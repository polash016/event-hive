/* eslint-disable @typescript-eslint/no-explicit-any */
import { Admin, Prisma, UserStatus } from '@prisma/client'
import { adminSearchFields } from './admin.constant'
import calculatePagination from '../../../helpers/paginationHelper'
import prisma from '../../../shared/prisma'
import { TAdminFilterRequest } from './admin.interface'
import { TPaginationOptions } from '../../interfaces/pagination'

const getAllAdmin = async (
  params: TAdminFilterRequest,
  options: TPaginationOptions,
) => {
  const { limit, page, skip } = calculatePagination(options)
  const andConditions: Prisma.AdminWhereInput[] = []

  const { searchTerm, ...filterData } = params

  if (searchTerm) {
    andConditions.push({
      OR: adminSearchFields.map(field => ({
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

  const whereConditions: Prisma.AdminWhereInput = { AND: andConditions }
  const result = await prisma.admin.findMany({
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

  const total = await prisma.admin.count({ where: whereConditions })

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const getSingleAdmin = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUniqueOrThrow({
    where: {
      id: id,
      isDeleted: false,
    },
  })

  return result
}

const getAdminStatistics = async () => {
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
    },
  })

  const currentMonthRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      paymentStatus: 'success',
      createdAt: {
        gte: currentMonthStart,
        lt: currentMonthEnd,
      },
    },
  })

  const totalSuccessfulTransactions = await prisma.payment.count({
    where: {
      paymentStatus: 'success',
    },
  })

  const totalTicketSold = await prisma.event.aggregate({
    _sum: {
      ticketSold: true,
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

const updateAdmin = async (
  id: string,
  payload: Partial<Admin>,
): Promise<Admin | null> => {
  const result = await prisma.admin.update({
    where: {
      id: id,
      isDeleted: false,
    },
    data: payload,
  })

  return result
}

const deleteAdmin = async (id: string) => {
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

const softDeleteAdmin = async (id: string) => {
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

export const adminServices = {
  getAllAdmin,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
  getAdminStatistics,
}
