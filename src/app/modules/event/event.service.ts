/* eslint-disable @typescript-eslint/no-explicit-any */
import { Event, EventType, Prisma, UserRole, UserStatus } from '@prisma/client'
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

  const speakerImage = files?.speakerImg

  const artistImage = files?.artistImg

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
  email: string,
) => {
  const { limit, page, skip } = calculatePagination(options)
  const andConditions: Prisma.EventWhereInput[] = []

  const { searchTerm, ...filterData } = params

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
    select: { id: true, role: true },
  })

  if (searchTerm) {
    andConditions.push({
      OR: [
        ...eventSearchFields
          .map(field => ({
            [field]: {
              contains: params.searchTerm,
              mode: 'insensitive',
            },
          }))
          .filter(Boolean),
        {
          artist: {
            name: {
              contains: params.searchTerm,
              mode: 'insensitive',
            },
          },
        },

        // Search in related Speaker name
        {
          speaker: {
            name: {
              contains: params.searchTerm,
              mode: 'insensitive',
            },
          },
        },

        // Search in related Location city
        {
          location: {
            city: {
              contains: params.searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ],
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

  if (user.role === UserRole.ORGANIZER) {
    andConditions.push({
      organizerId: user?.id,
    })
  }

  const whereConditions: Prisma.EventWhereInput = { AND: andConditions }

  const result = await prisma.event.findMany({
    where: {
      ...whereConditions,
      organizer: {
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
    include: {
      images: true,
      location: true,
      speaker: true,
      artist: true,
    },
  })

  return result
}

const updateEvent = async (id: string, req: any): Promise<Event | null> => {
  const files = req?.files
  const data = req?.body

  const eventImages = files?.events

  const speakerImage = files?.speakerImg

  const artistImage = files?.artistImg

  const { event, location, artist, speaker } = data

  const { date, startTime, ...eventData } = event

  const existingEvent = await prisma.event.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      location: true,
      artist: true,
      speaker: true,
    },
  })

  if (date && startTime) {
    const [hours, minutes] = startTime.split(':').map(Number)

    const baseDate = new Date(format(date, 'yyyy-MM-dd'))
    const dateTime = add(baseDate, {
      hours: hours,
      minutes: minutes,
    })
    const utcDateTime = dateTime.toISOString()
    eventData.dateTime = utcDateTime
  }

  if (eventData?.dateTime) {
    const existingEventSchedule = await prisma.event.findFirst({
      where: {
        id: { not: id },
        dateTime: eventData?.dateTime,
      },
    })

    if (existingEventSchedule) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Already Booked for this Schedule',
      )
    }
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

  await prisma.$transaction(async trans => {
    let updatedEvent
    if (eventData) {
      updatedEvent = await trans.event.update({
        where: {
          id,
        },
        data: { ...eventData },
      })
    }

    if (location && (location.street || location.city || location.country))
      await trans.eventLocation.update({
        where: {
          id: existingEvent.location?.id,
        },
        data: { ...location },
      })

    if (artist && (artist.name || artist.bio || artist.genre)) {
      await trans.artist.update({
        where: {
          id: existingEvent.artist?.id,
        },
        data: { ...artist },
      })
    }

    if (speaker && (speaker.name || speaker.bio || speaker.expertise)) {
      await trans.speaker.update({
        where: {
          id: existingEvent.speaker?.id,
        },
        data: { ...speaker },
      })
    }

    return updatedEvent
  })

  if (eventImages) {
    const uploadToCloudinary =
      await fileUploader.uploadFilesToCloudinary(eventImages)

    uploadToCloudinary.forEach(async file => {
      if (file?.secure_url) {
        const data = {
          eventId: id,
          imageUrl: file?.secure_url,
        }

        await prisma.eventImage.create({
          data: data,
        })
      }
    })
  }

  const result = await prisma.event.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      images: true,
      location: true,
      artist: true,
      speaker: true,
    },
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
