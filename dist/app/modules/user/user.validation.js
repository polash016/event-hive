"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createAdmin = zod_1.z.object({
    password: zod_1.z.string({ required_error: 'Password is required' }).min(6),
    admin: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        email: zod_1.z.string({ required_error: 'Email is required' }).email(),
        contactNumber: zod_1.z.string({ required_error: 'Contact Number is required' }),
    }),
});
const GenderEnum = zod_1.z.enum([client_1.Gender.MALE, client_1.Gender.FEMALE, client_1.Gender.OTHERS]);
const createOrganizer = zod_1.z.object({
    password: zod_1.z.string({ required_error: 'Password is required' }).min(6),
    organizer: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        email: zod_1.z.string({ required_error: 'Email is required' }).email(),
        profilePhoto: zod_1.z.string().url().optional(),
        contactNumber: zod_1.z.string({ required_error: 'Contact Number is required' }),
        address: zod_1.z.string().optional(),
        organizationName: zod_1.z.string({
            required_error: 'Organization Name is required',
        }),
        gender: GenderEnum,
        websiteUrl: zod_1.z
            .string({
            required_error: 'Website Url is required',
        })
            .optional(),
        socialMediaUrl: zod_1.z
            .string({ required_error: 'SocialMedia Url is required' })
            .optional(),
    }),
});
const createAttendee = zod_1.z.object({
    password: zod_1.z.string({ required_error: 'Password is required' }).min(6),
    attendee: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        email: zod_1.z.string({ required_error: 'Email is required' }).email(),
        contactNumber: zod_1.z.string({ required_error: 'Contact Number is required' }),
        address: zod_1.z.string().optional(),
        gender: GenderEnum,
    }),
});
const updateProfileStatus = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum([client_1.UserStatus.ACTIVE, client_1.UserStatus.BLOCKED, client_1.UserStatus.DELETED]),
    }),
});
exports.userValidation = {
    createAdmin,
    createOrganizer,
    createAttendee,
    updateProfileStatus,
};
