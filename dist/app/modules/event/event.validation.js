"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createEvent = zod_1.z.object({
    // body: z.object({
    // }),
    name: zod_1.z.string({ required_error: 'Name is required' }),
    description: zod_1.z.string().optional(),
    date: zod_1.z.string({ required_error: 'Date is required' }),
    street: zod_1.z.string().optional(),
    city: zod_1.z.string({ required_error: 'City is required' }),
    country: zod_1.z.string().optional(),
    totalTicket: zod_1.z.number({ required_error: 'Total Ticket is required' }),
    status: zod_1.z.enum([
        client_1.EventStatus.UPCOMING,
        client_1.EventStatus.ONGOING,
        client_1.EventStatus.ENDED,
    ]),
});
const updateEvent = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        contactNumber: zod_1.z.string().optional(),
    }),
});
exports.EventValidation = {
    updateEvent,
    createEvent,
};
