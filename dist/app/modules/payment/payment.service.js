"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const stripe_1 = require("../../../shared/stripe");
const config_1 = __importDefault(require("../../config"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const initPayment = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const event = yield prisma_1.default.event.findFirstOrThrow({
        where: {
            id,
        },
    });
    const user = yield prisma_1.default.user.findFirstOrThrow({
        where: {
            email,
        },
        include: {
            attendee: true,
        },
    });
    const transactionId = (0, uuid_1.v4)();
    const data = {
        store_id: config_1.default.ssl_store_id,
        store_passwd: config_1.default.ssl_api_key,
        total_amount: event.ticketPrice,
        currency: 'BDT',
        tran_id: transactionId,
        success_url: config_1.default.ssl_success_url,
        fail_url: config_1.default.ssl_fail_url,
        cancel_url: config_1.default.ssl_cancel_url,
        ipn_url: 'https://event-hive-two.vercel.app/api/v1/payment/ipn',
        shipping_method: 'N/A',
        product_name: 'Event.',
        product_category: 'Entertainment',
        product_profile: 'general',
        cus_name: (_a = user.attendee) === null || _a === void 0 ? void 0 : _a.name,
        cus_email: user.email,
        cus_add1: (_b = user.attendee) === null || _b === void 0 ? void 0 : _b.address,
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: (_c = user.attendee) === null || _c === void 0 ? void 0 : _c.contactNumber,
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    yield prisma_1.default.payment.create({
        data: {
            userId: user.id,
            eventId: event.id,
            transactionId: data.tran_id,
            amount: event.ticketPrice,
            currency: 'BDT',
            paymentStatus: 'PENDING',
        },
    });
    const res = yield (0, axios_1.default)({
        method: 'POST',
        url: config_1.default.ssl_payment_api,
        data: data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return { paymentUrl: res.data.GatewayPageURL };
});
const validatePayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    if (!query || !(query.status === 'VALID')) {
        return {
            message: 'Invalid Payment',
        };
    }
    const res = yield (0, axios_1.default)({
        method: 'GET',
        url: `${config_1.default.ssl_validation_api}?val_id=${query.val_id}&store_id=${config_1.default.ssl_store_id}&store_passwd=${config_1.default.ssl_api_key}&format=json`,
    });
    if (res.data.status !== 'VALID') {
        return {
            message: 'Payment Failed',
        };
    }
    // const res = query
    const payment = yield prisma_1.default.payment.findUniqueOrThrow({
        where: {
            transactionId: query.tran_id,
        },
    });
    yield prisma_1.default.$transaction((trans) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        yield trans.payment.update({
            where: {
                transactionId: query.tran_id,
            },
            data: {
                paymentStatus: 'COMPLETED',
                paymentMethod: ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.card_type) || 'BDT',
                paymentGatewayData: res.data,
            },
        });
        yield trans.event.update({
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
        });
    }));
    return {
        message: 'Payment Successful',
        paymentDetails: res.data,
    };
});
const checkoutPaymentSession = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.default.event.findFirstOrThrow({
        where: {
            id,
        },
        include: {
            images: true,
        },
    });
    yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email,
        },
    });
    // const lineItems = [
    //   {
    //     price_data: {
    //       currency: 'usd',
    //       product_data: {
    //         name: event.name,
    //         images: [event.images[0]],
    //       },
    //       unit_amount: Number(event.ticketPrice),
    //     },
    //     quantity: 1,
    //   },
    // ]
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: lineItems,
    //   mode: 'payment',
    //   success_url: '',
    //   cancel_url: '',
    // })
    const paymentIntent = yield stripe_1.stripe.paymentIntents.create({
        amount: event.ticketPrice * 100,
        currency: 'BDT',
        metadata: { products: JSON.stringify(event) },
    });
    console.log('checkout 152 line', paymentIntent);
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
    return paymentIntent;
});
const constructEvent = (payload, signature) => __awaiter(void 0, void 0, void 0, function* () {
    return stripe_1.stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
});
const handleWebhookEvent = (event) => __awaiter(void 0, void 0, void 0, function* () {
    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            yield handleSuccessfulPayment(paymentIntent);
            break;
        }
        // Add more cases as needed
    }
});
const handleSuccessfulPayment = (paymentIntent) => __awaiter(void 0, void 0, void 0, function* () {
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
    console.log('payment intent of webhook', { paymentIntent });
});
exports.paymentService = {
    initPayment,
    validatePayment,
    checkoutPaymentSession,
    constructEvent,
    handleWebhookEvent,
    handleSuccessfulPayment,
};
