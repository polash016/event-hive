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
    ipn_url: 'http://localhost:3030/ipn',
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
  })

  await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: event.ticketPrice * 100,
    currency: 'BDT',
    metadata: { products: JSON.stringify(event) },
  })

  console.log('checkout 152 line', paymentIntent)

  // const transactionId = uuidv4()

  // const data = {
  //   store_id: config.ssl_store_id,
  //   store_passwd: config.ssl_api_key,
  //   total_amount: event.ticketPrice,
  //   currency: 'BDT',
  //   tran_id: transactionId,
  //   success_url: config.ssl_success_url,
  //   fail_url: config.ssl_fail_url,
  //   cancel_url: config.ssl_cancel_url,
  //   ipn_url: 'http://localhost:3030/ipn',
  //   shipping_method: 'N/A',
  //   product_name: 'Event.',
  //   product_category: 'Entertainment',
  //   product_profile: 'general',
  //   cus_name: user.attendee?.name,
  //   cus_email: user.email,
  //   cus_add1: user.attendee?.address,
  //   cus_add2: 'Dhaka',
  //   cus_city: 'Dhaka',
  //   cus_state: 'Dhaka',
  //   cus_postcode: '1000',
  //   cus_country: 'Bangladesh',
  //   cus_phone: user.attendee?.contactNumber,
  //   cus_fax: '01711111111',
  //   ship_name: 'Customer Name',
  //   ship_add1: 'Dhaka',
  //   ship_add2: 'Dhaka',
  //   ship_city: 'Dhaka',
  //   ship_state: 'Dhaka',
  //   ship_postcode: 1000,
  //   ship_country: 'Bangladesh',
  // }

  // const payment = await prisma.payment.create({
  //   data: {
  //     userId: user.id,
  //     eventId: event.id,
  //     transactionId: paymentIntent.client_secret!,
  //     amount: paymentIntent.amount,
  //     currency: paymentIntent.currency,
  //     paymentStatus: paymentIntent.status,
  //   },
  // })

  // console.log({ payment })

  // const res = await axios({
  //   method: 'POST',
  //   url: config.ssl_payment_api,
  //   data: data,
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  // })

  return paymentIntent
}

const constructEvent = async (payload: string, signature: string) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET as string,
  )
}

const handleWebhookEvent = async (event: any) => {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object
      await handleSuccessfulPayment(paymentIntent)
      break
    }
    // Add more cases as needed
  }
}

const handleSuccessfulPayment = async (paymentIntent: any) => {
  // await prisma.$transaction(async trans => {
  //   await trans.payment.update({
  //     where: {
  //       transactionId: query.tran_id,
  //     },
  //     data: {
  //       paymentStatus: 'COMPLETED',
  //       paymentMethod: res?.data?.card_type || 'BDT',
  //       paymentGatewayData: res.data,
  //     },
  //   })

  //   await trans.event.update({
  //     where: {
  //       id: payment.eventId,
  //     },
  //     data: {
  //       ticketSold: {
  //         increment: 1,
  //       },
  //       totalTicket: {
  //         decrement: 1,
  //       },
  //     },
  //   })
  // })
  // Update your database, e.g., mark an order as paid
  // await prisma.payment.update({
  //   where: { id: paymentIntent.metadata.orderId },
  //   data: { paymentStatus: 'PAID' },
  // })
  console.log({ paymentIntent })
}

export const paymentService = {
  initPayment,
  validatePayment,
  checkoutPaymentSession,
  constructEvent,
  handleWebhookEvent,
  handleSuccessfulPayment,
}
