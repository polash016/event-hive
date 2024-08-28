/* eslint-disable @typescript-eslint/no-explicit-any */
import { Event, EventType, Prisma } from '@prisma/client'
import calculatePagination from '../../../helpers/paginationHelper'
import { TPaginationOptions } from '../../interfaces/pagination'
import { TEventFilterRequest } from './event.interface'
import { eventSearchFields } from './event.constant'
import prisma from '../../../shared/prisma'
import { fileUploader } from '../../../helpers/fileUploader'
import { add, format } from 'date-fns'
import AppError from '../../errors/AppError'
import httpStatus from 'http-status'

const createEvent = async (req: any) => {
  const files = req?.files
  const data = req.body

  const eventImages = files?.events

  const speakerImage = files?.speaker

  const artistImage = files?.artist

  const { event, location, artist, speaker } = data

  const { date, startTime, ...eventData } = event

  const [hours, minutes] = startTime.split(':').map(Number)

  const baseDate = new Date(format(date, 'yyyy-MM-dd'))

  const dateTime = add(baseDate, {
    hours: hours,
    minutes: minutes,
  })

  eventData.dateTime = dateTime

  const existingEventSchedule = await prisma.event.findFirst({
    where: {
      dateTime: eventData.dateTime,
    },
  })

  if (existingEventSchedule) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Already Booked for this Schedule',
    )
  }

  if (artistImage) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(
      artistImage[0],
    )
    artist.imageUrl = uploadToCloudinary?.secure_url
  }

  if (speakerImage) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(
      speakerImage[0],
    )

    speaker.imageUrl = uploadToCloudinary?.secure_url
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: req.user.email,
    },
  })

  eventData.organizerId = user.id

  const result = await prisma.$transaction(async trans => {
    const createEvent = await trans.event.create({
      data: { ...eventData },
    })

    await trans.eventLocation.create({
      data: { ...location, eventId: createEvent.id },
    })

    if (artist) {
      await trans.artist.create({
        data: { ...artist, eventId: createEvent.id },
      })
    }

    if (speaker) {
      await trans.speaker.create({
        data: { ...speaker, eventId: createEvent.id },
      })
    }

    return createEvent
  })

  if (eventImages) {
    const uploadToCloudinary =
      await fileUploader.uploadFilesToCloudinary(eventImages)

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
      artist: true,
      speaker: true,
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
      location: true,
      speaker: true,
      artist: true,
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
  const event = await prisma.event.findUniqueOrThrow({
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

    await trans.eventLocation.deleteMany({
      where: {
        eventId: id,
      },
    })

    if (event.type === EventType.CONCERT) {
      await trans.artist.deleteMany({
        where: {
          eventId: id,
        },
      })
    }

    if (event.type === EventType.CONFERENCE) {
      await trans.speaker.deleteMany({
        where: {
          eventId: id,
        },
      })
    }

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
