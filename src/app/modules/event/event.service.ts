/* eslint-disable @typescript-eslint/no-explicit-any */
import { Event, Prisma } from '@prisma/client'
import calculatePagination from '../../../helpers/paginationHelper'
import { TPaginationOptions } from '../../interfaces/pagination'
import { TEventFilterRequest } from './event.interface'
import { eventSearchFields } from './event.constant'
import prisma from '../../../shared/prisma'
import { fileUploader } from '../../../helpers/fileUploader'

const createEvent = async (req: any) => {
  const files = req.files
  const data = req.body

  const { street, city, country, ...eventData } = data

  const location: {
    street: string
    city: string
    country: string
  } = { street, city, country }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: req.user.email,
    },
  })

  eventData.organizerId = user.id

  console.log(location)

  const result = await prisma.$transaction(async trans => {
    const result = await trans.event.create({
      data: eventData,
    })

    await trans.eventLocation.create({
      data: { ...location, eventId: result.id },
    })

    return result
  })

  if (files) {
    const uploadToCloudinary = await fileUploader.uploadFilesToCloudinary(files)

    uploadToCloudinary.forEach(async file => {
      if (file?.secure_url) {
        const data = {
          eventId: result.id,
          imageUrl: file?.secure_url,
        }

        await prisma.eventImage.create({
          data: data,
        })
      }
    })
  }

  const dataWithImage = await prisma.event.findUniqueOrThrow({
    where: {
      id: result.id,
    },
    include: {
      images: true,
      location: true,
    },
  })

  return dataWithImage
}

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
    include: {
      images: true,
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
  await prisma.event.findUniqueOrThrow({
    where: {
      id,
    },
  })

  const result = await prisma.$transaction(async trans => {
    await trans.eventImage.deleteMany({
      where: {
        eventId: id,
      },
    })

    const deletedEvent = await trans.event.delete({
      where: {
        id,
      },
    })

    return deletedEvent
  })

  return result
}

export const eventServices = {
  createEvent,
  getAllEvent,
  getSingleEvent,
  updateEvent,
  deleteEvent,
}
