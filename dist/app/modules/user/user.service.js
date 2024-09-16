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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const fileUploader_1 = require("../../../helpers/fileUploader");
const paginationHelper_1 = __importDefault(require("../../../helpers/paginationHelper"));
const user_const_1 = require("./user.const");
const createAdmin = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const data = req.body;
    if (file) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        data.admin.profilePhoto = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    const hashedPassword = yield bcrypt_1.default.hash(data.password, Number(config_1.default.salt_rounds));
    const userData = {
        email: data.admin.email,
        password: hashedPassword,
        role: client_1.UserRole.ADMIN,
    };
    const result = yield prisma_1.default.$transaction((transClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transClient.user.create({
            data: userData,
        });
        const createAdminData = yield transClient.admin.create({
            data: data.admin,
        });
        return createAdminData;
    }));
    return result;
});
const createOrganizer = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const data = req.body;
    if (file) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        data.organizer.profilePhoto = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    const hashedPassword = yield bcrypt_1.default.hash(data.password, Number(config_1.default.salt_rounds));
    const userData = {
        email: data.organizer.email,
        password: hashedPassword,
        role: client_1.UserRole.ORGANIZER,
    };
    const result = yield prisma_1.default.$transaction((transClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transClient.user.create({
            data: userData,
        });
        const createOrganizerData = yield transClient.organizer.create({
            data: data.organizer,
        });
        return createOrganizerData;
    }));
    return result;
});
const createAttendee = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const data = req.body;
    if (file) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        data.attendee.profilePhoto = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    const hashedPassword = yield bcrypt_1.default.hash(data.password, Number(config_1.default.salt_rounds));
    const userData = {
        email: data.attendee.email,
        password: hashedPassword,
        role: client_1.UserRole.ATTENDEE,
    };
    const result = yield prisma_1.default.$transaction((transClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transClient.user.create({
            data: userData,
        });
        const createAttendeeData = yield transClient.attendee.create({
            data: data.attendee,
        });
        return createAttendeeData;
    }));
    return result;
});
const getAllUsers = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = (0, paginationHelper_1.default)(options);
    const andConditions = [];
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    if (params.searchTerm) {
        andConditions.push({
            OR: user_const_1.userFilterField.map(field => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    andConditions.push({
        status: 'ACTIVE',
    });
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
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
    });
    const total = yield prisma_1.default.user.count({ where: whereConditions });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const changeStatus = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const result = yield prisma_1.default.user.update({
        where: {
            id,
        },
        data: data,
    });
    return {
        data: result,
    };
});
const getProfile = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });
    let profileInfo;
    if (userInfo.role === client_1.UserRole.SUPER_ADMIN) {
        profileInfo = yield prisma_1.default.admin.findUnique({
            where: {
                email: userInfo.email,
            },
        });
    }
    else if (userInfo.role === client_1.UserRole.ADMIN) {
        profileInfo = yield prisma_1.default.admin.findUnique({
            where: {
                email: userInfo.email,
            },
        });
    }
    else if (userInfo.role === client_1.UserRole.ORGANIZER) {
        profileInfo = yield prisma_1.default.organizer.findUnique({
            where: {
                email: userInfo.email,
            },
            include: {
                user: {
                    include: {
                        event: true,
                    },
                },
            },
        });
    }
    else if (userInfo.role === client_1.UserRole.ATTENDEE) {
        profileInfo = yield prisma_1.default.attendee.findUnique({
            where: {
                email: userInfo.email,
            },
        });
    }
    return Object.assign(Object.assign({}, userInfo), profileInfo);
});
const updateProfile = (user, req) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const file = req.file;
    if (file) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        data.profilePhoto = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    const userInfo = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    let profileInfo;
    if (userInfo.role === client_1.UserRole.SUPER_ADMIN) {
        profileInfo = yield prisma_1.default.admin.update({
            where: {
                email: userInfo.email,
            },
            data,
        });
    }
    else if (userInfo.role === client_1.UserRole.ADMIN) {
        profileInfo = yield prisma_1.default.admin.update({
            where: {
                email: userInfo.email,
            },
            data,
        });
    }
    else if (userInfo.role === client_1.UserRole.ORGANIZER) {
        profileInfo = yield prisma_1.default.organizer.update({
            where: {
                email: userInfo.email,
            },
            data,
        });
    }
    else if (userInfo.role === client_1.UserRole.ATTENDEE) {
        profileInfo = yield prisma_1.default.attendee.update({
            where: {
                email: userInfo.email,
            },
            data,
        });
    }
    return Object.assign(Object.assign({}, userInfo), profileInfo);
});
exports.userService = {
    createAdmin,
    createOrganizer,
    createAttendee,
    getAllUsers,
    changeStatus,
    getProfile,
    updateProfile,
};
