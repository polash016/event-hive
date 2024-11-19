/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../shared/prisma'
import { stripe } from '../../../shared/stripe'
import config from '../../config'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const initPayment = async (id: string, email: string) => {
  const event = await prisma.event.findFirstOrThrow({
    where: {
      id,
    },
  })

  const user = await prisma.user.findFirstOrThrow({
    where: {
      email,
    },
    include: {
      attendee: true,
    },
  })

  const transactionId = uuidv4()

  const data = {
    store_id: config.ssl_store_id,
    store_passwd: config.ssl_api_key,
    total_amount: event.ticketPrice,
    currency: 'BDT',
    tran_id: transactionId,
    success_url: config.ssl_success_url,
    fail_url: config.ssl_fail_url,
    cancel_url: config.ssl_cancel_url,
    ipn_url: 'https://event-hive-two.vercel.app/api/v1/payment/ipn',
    shipping_method: 'N/A',
    product_name: 'Event.',
    product_category: 'Entertainment',
    product_profile: 'general',
    cus_name: user.attendee?.name,
    cus_email: user.email,
    cus_add1: user.attendee?.address,
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: user.attendee?.contactNumber,
    cus_fax: '01711111111',
    ship_name: 'Customer Name',
    ship_add1: 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh',
  }

  await prisma.payment.create({
    data: {
      userId: user.id,
      eventId: event.id,
      transactionId: data.tran_id,
      amount: event.ticketPrice,
      currency: 'BDT',
      paymentStatus: 'PENDING',
    },
  })

  const res = await axios({
    method: 'POST',
    url: config.ssl_payment_api,
    data: data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  return { paymentUrl: res.data.GatewayPageURL }
}

const validatePayment = async (query: Record<string, any>) => {
  if (!query || !(query.status === 'VALID')) {
    return {
      message: 'Invalid Payment',
    }
  }

  const res = await axios({
    method: 'GET',
    url: `${config.ssl_validation_api}?val_id=${query.val_id}&store_id=${config.ssl_store_id}&store_passwd=${config.ssl_api_key}&format=json`,
  })

  if (res.data.status !== 'VALID') {
    return {
      message: 'Payment Failed',
    }
  }

  // const res = query

  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      transactionId: query.tran_id,
    },
  })

  await prisma.$transaction(async trans => {
    await trans.payment.update({
      where: {
        transactionId: query.tran_id,
      },
      data: {
        paymentStatus: 'COMPLETED',
        paymentMethod: res?.data?.card_type || 'BDT',
        paymentGatewayData: res.data,
      },
    })

    await trans.event.update({
      where: {
        id: payment.eventId,
      },
      data: {
        ticketSold: {
          increment: 1,
        },
        totalTicket: {
          decrement: 1,
        },
      },
    })
  })

  return {
    message: 'Payment Successful',
    paymentDetails: res.data,
  }
}

const checkoutPaymentSession = async (id: string, email: string) => {
  const event = await prisma.event.findFirstOrThrow({
    where: {
      id,
    },
    include: {
      images: true,
    },
  })

  await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(event.ticketPrice) * 100,
    currency: 'USD',
    payment_method_types: ['card'],
  })

  return paymentIntent
}

const handleSuccessfulPayment = async (paymentData: any, email: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  })

  await prisma.$transaction(async trans => {
    await trans.payment.create({
      data: {
        userId: user.id,
        ...paymentData,
      },
    })

    await trans.event.update({
      where: {
        id: paymentData.eventId,
      },
      data: {
        ticketSold: {
          increment: 1,
        },
        totalTicket: {
          decrement: 1,
        },
      },
    })
  })

  const successPaymentData = await prisma.payment.findUnique({
    where: {
      transactionId: paymentData.transactionId,
    },
    include: {
      event: true,
      user: true,
    },
  })

  return successPaymentData
}

const getMyPayments = async (email: string) => {
  const userDetails = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  const result = await prisma.payment.findMany({
    where: {
      userId: userDetails?.id,
      paymentStatus: {
        contains: 'success',
        mode: 'insensitive',
      },
    },
    include: {
      event: {
        include: {
          images: true,
          location: true,
          guest: true,
        },
      },
      user: true,
    },
  })

  return result
}

export const paymentService = {
  initPayment,
  validatePayment,
  checkoutPaymentSession,
  handleSuccessfulPayment,
  getMyPayments,
}
