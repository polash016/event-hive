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
exports.organizerServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const paginationHelper_1 = __importDefault(require("../../../helpers/paginationHelper"));
const organizer_constant_1 = require("./organizer.constant");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const getAllOrganizer = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = (0, paginationHelper_1.default)(options);
    const andConditions = [];
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    if (searchTerm) {
        andConditions.push({
            OR: organizer_constant_1.organizerSearchFields.map(field => ({
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
        isDeleted: false,
    });
    const whereConditions = { AND: andConditions };
    const result = yield prisma_1.default.organizer.findMany({
        where: Object.assign(Object.assign({}, whereConditions), { user: {
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
            user: {
                include: {
                    event: true,
                },
            },
        },
    });
    const total = yield prisma_1.default.organizer.count({ where: whereConditions });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getSingleOrganizer = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: id,
            status: client_1.UserStatus.ACTIVE,
        },
        include: {
            organizer: true,
        },
    });
    return result;
});
const updateOrganizer = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.organizer.update({
        where: {
            id: id,
            isDeleted: false,
        },
        data: payload,
    });
    return result;
});
const softDeleteOrganizer = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.organizer.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const result = yield prisma_1.default.$transaction((trans) => __awaiter(void 0, void 0, void 0, function* () {
        const deleteOrganizer = yield trans.organizer.delete({
            where: {
                id: id,
            },
        });
        yield trans.user.delete({
            where: {
                email: deleteOrganizer.email,
            },
        });
        yield trans.event.updateMany({
            where: {
                organizerId: deleteOrganizer.id,
            },
            data: { isDeleted: true },
        });
        return deleteOrganizer;
    }));
    return result;
});
exports.organizerServices = {
    getAllOrganizer,
    getSingleOrganizer,
    updateOrganizer,
    softDeleteOrganizer,
};
