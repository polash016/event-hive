/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, UserRole, UserStatus } from '@prisma/client'
import bcrypt from 'bcrypt'
import config from '../../config'
import prisma from '../../../shared/prisma'
import { fileUploader } from '../../../helpers/fileUploader'
import { TPaginationOptions } from '../../interfaces/pagination'
import calculatePagination from '../../../helpers/paginationHelper'
import { JwtPayload } from 'jsonwebtoken'
import { userFilterField, userSearchableField } from './user.const'

const createAdmin = async (req: any) => {
  const file = req.file
  const data = req.body

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file)

    data.admin.profilePhoto = uploadToCloudinary?.secure_url
  }

  const hashedPassword: string = await bcrypt.hash(
    data.password,
    Number(config.salt_rounds),
  )

  const userData = {
    email: data.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  }

  const result = await prisma.$transaction(async transClient => {
    await transClient.user.create({
      data: userData,
    })

    const createAdminData = await transClient.admin.create({
      data: data.admin,
    })
    return createAdminData
  })
  return result
}

const createOrganizer = async (req: any) => {
  const file = req.file
  const data = req.body

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file)

    data.organizer.profilePhoto = uploadToCloudinary?.secure_url
  }

  const hashedPassword: string = await bcrypt.hash(
    data.password,
    Number(config.salt_rounds),
  )

  const userData = {
    email: data.organizer.email,
    password: hashedPassword,
    role: UserRole.ORGANIZER,
  }

  const result = await prisma.$transaction(async transClient => {
    await transClient.user.create({
      data: userData,
    })

    const createOrganizerData = await transClient.organizer.create({
      data: data.organizer,
    })
    return createOrganizerData
  })
  return result
}

const createAttendee = async (req: any) => {
  const file = req.file
  const data = req.body

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file)

    data.attendee.profilePhoto = uploadToCloudinary?.secure_url
  }

  const hashedPassword: string = await bcrypt.hash(
    data.password,
    Number(config.salt_rounds),
  )
  console.log({ data })

  const userData = {
    email: data.attendee.email,
    password: hashedPassword,
    role: UserRole.ATTENDEE,
  }

  const result = await prisma.$transaction(async transClient => {
    await transClient.user.create({
      data: userData,
    })

    const createAttendeeData = await transClient.attendee.create({
      data: data.attendee,
    })
    return createAttendeeData
  })
  return result
}

const getAllUsers = async (params: any, options: TPaginationOptions) => {
  const { limit, page, skip } = calculatePagination(options)
  const andConditions: Prisma.UserWhereInput[] = []

  const { searchTerm, ...filterData } = params

  if (params.searchTerm) {
    andConditions.push({
      OR: userFilterField.map(field => ({
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
    status: 'ACTIVE',
  })

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {}
  const result = await prisma.user.findMany({
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
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      organizer: true,
      attendee: true,
    },

    // {
    //   admin: true,
    //   patient: true,
    //   doctor: true
    // }
  })

  const total = await prisma.user.count({ where: whereConditions })

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const changeStatus = async (id: string, data: { status: UserStatus }) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  })

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: data,
  })

  return {
    data: result,
  }
}

const getProfile = async (user: JwtPayload) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  })

  let profileInfo

  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    })
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    })
  } else if (userInfo.role === UserRole.ORGANIZER) {
    profileInfo = await prisma.organizer.findUnique({
      where: {
        email: userInfo.email,
      },
    })
  } else if (userInfo.role === UserRole.ATTENDEE) {
    profileInfo = await prisma.attendee.findUnique({
      where: {
        email: userInfo.email,
      },
    })
  }

  return { ...userInfo, ...profileInfo }
}

const updateProfile = async (user: JwtPayload, req: any) => {
  const data = req.body
  const file = req.file

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file)

    data.profilePhoto = uploadToCloudinary?.secure_url
  }

  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  })

  let profileInfo

  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data,
    })
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data,
    })
  } else if (userInfo.role === UserRole.ORGANIZER) {
    profileInfo = await prisma.organizer.update({
      where: {
        email: userInfo.email,
      },
      data,
    })
  } else if (userInfo.role === UserRole.ATTENDEE) {
    profileInfo = await prisma.attendee.update({
      where: {
        email: userInfo.email,
      },
      data,
    })
  }

  return { ...userInfo, ...profileInfo }
}

export const userService = {
  createAdmin,
  createOrganizer,
  createAttendee,
  getAllUsers,
  changeStatus,
  getProfile,
  updateProfile,
}
