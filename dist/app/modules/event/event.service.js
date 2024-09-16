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
exports.eventServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const paginationHelper_1 = __importDefault(require("../../../helpers/paginationHelper"));
const event_constant_1 = require("./event.constant");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const fileUploader_1 = require("../../../helpers/fileUploader");
const date_fns_1 = require("date-fns");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createEvent = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req === null || req === void 0 ? void 0 : req.files;
    const data = req.body;
    const eventImages = files === null || files === void 0 ? void 0 : files.events;
    const guestImg = files === null || files === void 0 ? void 0 : files.guestImg;
    const { event, location, guest, categories } = data;
    const { date, startTime } = event, eventData = __rest(event, ["date", "startTime"]);
    const [hours, minutes] = startTime.split(':').map(Number);
    const baseDate = new Date((0, date_fns_1.format)(date, 'yyyy-MM-dd'));
    const dateTime = (0, date_fns_1.add)(baseDate, {
        hours: hours,
        minutes: minutes,
    });
    eventData.dateTime = dateTime;
    const existingEventSchedule = yield prisma_1.default.event.findFirst({
        where: {
            dateTime: eventData.dateTime,
        },
    });
    if (existingEventSchedule) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Already Booked for this Schedule');
    }
    if (guestImg) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(guestImg[0]);
        guest.imageUrl = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: req.user.email,
        },
    });
    eventData.organizerId = user.id;
    const result = yield prisma_1.default.$transaction((trans) => __awaiter(void 0, void 0, void 0, function* () {
        const createEvent = yield trans.event.create({
            data: Object.assign({}, eventData),
        });
        yield trans.eventLocation.create({
            data: Object.assign(Object.assign({}, location), { eventId: createEvent.id }),
        });
        yield trans.guest.create({
            data: Object.assign(Object.assign({}, guest), { eventId: createEvent.id }),
        });
        const eventCategoriesData = categories.map((categoriesId) => ({
            eventId: createEvent.id,
            categoryId: categoriesId,
        }));
        yield trans.eventCategory.createMany({
            data: eventCategoriesData,
        });
        return createEvent;
    }));
    if (eventImages) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadFilesToCloudinary(eventImages);
        uploadToCloudinary.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
            if (file === null || file === void 0 ? void 0 : file.secure_url) {
                const data = {
                    eventId: result.id,
                    imageUrl: file === null || file === void 0 ? void 0 : file.secure_url,
                };
                yield prisma_1.default.eventImage.create({
                    data,
                });
            }
        }));
    }
    const dataWithImage = yield prisma_1.default.event.findUniqueOrThrow({
        where: {
            id: result.id,
        },
        include: {
            images: true,
            location: true,
            guest: true,
            categories: true,
        },
    });
    return dataWithImage;
});
const getAllEvent = (params, options, email) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = (0, paginationHelper_1.default)(options);
    const andConditions = [];
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: { email },
        select: { id: true, role: true },
    });
    if (searchTerm) {
        andConditions.push({
            OR: [
                ...event_constant_1.eventSearchFields
                    .map(field => ({
                    [field]: {
                        contains: params.searchTerm,
                        mode: 'insensitive',
                    },
                }))
                    .filter(Boolean),
                {
                    guest: {
                        name: {
                            contains: params.searchTerm,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    location: {
                        city: {
                            contains: params.searchTerm,
                            mode: 'insensitive',
                        },
                    },
                },
            ],
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
        isDeleted: false,
    });
    if (user.role === client_1.UserRole.ORGANIZER) {
        andConditions.push({
            organizerId: user === null || user === void 0 ? void 0 : user.id,
        });
    }
    const whereConditions = { AND: andConditions };
    const result = yield prisma_1.default.event.findMany({
        where: Object.assign(Object.assign({}, whereConditions), { organizer: {
                status: client_1.UserStatus.ACTIVE,
            } }),
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? {
                [options.sortBy]: options.sortOrder,
            }
            : {
                createdAt: 'desc',
            },
        include: {
            images: true,
            location: true,
            guest: true,
            categories: {
                include: {
                    category: true,
                },
            },
        },
    });
    const total = yield prisma_1.default.event.count({ where: whereConditions });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getSingleEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.event.findUniqueOrThrow({
        where: {
            id: id,
            isDeleted: false,
        },
        include: {
            images: true,
            location: true,
            guest: true,
            categories: {
                include: {
                    category: true,
                },
            },
        },
    });
    return result;
});
const updateEvent = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req === null || req === void 0 ? void 0 : req.files;
    const data = req === null || req === void 0 ? void 0 : req.body;
    const eventImages = files === null || files === void 0 ? void 0 : files.events;
    const guestImage = files === null || files === void 0 ? void 0 : files.guestImg;
    const { event, location, guest, categories } = data;
    const { date, startTime } = event, eventData = __rest(event, ["date", "startTime"]);
    const existingEvent = yield prisma_1.default.event.findUniqueOrThrow({
        where: {
            id,
        },
        include: {
            location: true,
            guest: true,
            categories: true,
        },
    });
    let newCategories;
    if (categories) {
        const existingCategoryIds = existingEvent.categories.map(category => category.categoryId);
        // Filter out categories already existing in the relationship
        newCategories = categories.filter((categoryId) => !existingCategoryIds.includes(categoryId));
    }
    if (date && startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const baseDate = new Date((0, date_fns_1.format)(date, 'yyyy-MM-dd'));
        const dateTime = (0, date_fns_1.add)(baseDate, {
            hours: hours,
            minutes: minutes,
        });
        const utcDateTime = dateTime.toISOString();
        eventData.dateTime = utcDateTime;
    }
    if (eventData === null || eventData === void 0 ? void 0 : eventData.dateTime) {
        const existingEventSchedule = yield prisma_1.default.event.findFirst({
            where: {
                id: { not: id },
                dateTime: eventData === null || eventData === void 0 ? void 0 : eventData.dateTime,
            },
        });
        if (existingEventSchedule) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Already Booked for this Schedule');
        }
    }
    if (guestImage) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(guestImage[0]);
        guest.imageUrl = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    yield prisma_1.default.$transaction((trans) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        let updatedEvent;
        if (eventData) {
            updatedEvent = yield trans.event.update({
                where: {
                    id,
                },
                data: Object.assign({}, eventData),
            });
        }
        if (location && (location.street || location.city || location.country))
            yield trans.eventLocation.update({
                where: {
                    id: (_a = existingEvent.location) === null || _a === void 0 ? void 0 : _a.id,
                },
                data: Object.assign({}, location),
            });
        if (guest && (guest.name || guest.bio || guest.expertise)) {
            yield trans.guest.update({
                where: {
                    id: (_b = existingEvent.guest) === null || _b === void 0 ? void 0 : _b.id,
                },
                data: Object.assign({}, guest),
            });
        }
        if (newCategories && newCategories.length > 0) {
            yield trans.eventCategory.createMany({
                data: newCategories.map((categoryId) => ({
                    eventId: id,
                    categoryId,
                })),
            });
        }
        return updatedEvent;
    }));
    if (eventImages) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadFilesToCloudinary(eventImages);
        uploadToCloudinary.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
            if (file === null || file === void 0 ? void 0 : file.secure_url) {
                const data = {
                    eventId: id,
                    imageUrl: file === null || file === void 0 ? void 0 : file.secure_url,
                };
                yield prisma_1.default.eventImage.create({
                    data: data,
                });
            }
        }));
    }
    const result = yield prisma_1.default.event.findUniqueOrThrow({
        where: {
            id,
        },
        include: {
            images: true,
            location: true,
            guest: true,
        },
    });
    return result;
});
const deleteEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.event.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const result = yield prisma_1.default.$transaction((trans) => __awaiter(void 0, void 0, void 0, function* () {
        yield trans.eventCategory.deleteMany({
            where: {
                eventId: id,
            },
        });
        yield trans.eventImage.deleteMany({
            where: {
                eventId: id,
            },
        });
        yield trans.eventLocation.deleteMany({
            where: {
                eventId: id,
            },
        });
        yield trans.guest.deleteMany({
            where: {
                eventId: id,
            },
        });
        const deletedEvent = yield trans.event.delete({
            where: {
                id,
            },
        });
        return deletedEvent;
    }));
    return result;
});
exports.eventServices = {
    createEvent,
    getAllEvent,
    getSingleEvent,
    updateEvent,
    deleteEvent,
};
