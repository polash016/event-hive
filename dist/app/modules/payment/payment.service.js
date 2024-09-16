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
        ipn_url: 'http://localhost:3030/ipn',
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
exports.paymentService = {
    initPayment,
    validatePayment,
};
