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
exports.adminServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const admin_constant_1 = require("./admin.constant");
const paginationHelper_1 = __importDefault(require("../../../helpers/paginationHelper"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const getAllAdmin = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = (0, paginationHelper_1.default)(options);
    const andConditions = [];
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    if (searchTerm) {
        andConditions.push({
            OR: admin_constant_1.adminSearchFields.map(field => ({
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
    const result = yield prisma_1.default.admin.findMany({
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
    });
    const total = yield prisma_1.default.admin.count({ where: whereConditions });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getSingleAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.admin.findUniqueOrThrow({
        where: {
            id: id,
            isDeleted: false,
        },
    });
    return result;
});
const updateAdmin = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.admin.update({
        where: {
            id: id,
            isDeleted: false,
        },
        data: payload,
    });
    return result;
});
const deleteAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.admin.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const result = yield prisma_1.default.$transaction((trans) => __awaiter(void 0, void 0, void 0, function* () {
        const adminDelete = yield trans.admin.delete({
            where: {
                id: id,
            },
        });
        yield trans.user.delete({
            where: {
                email: adminDelete.email,
            },
        });
        return adminDelete;
    }));
    return result;
});
const softDeleteAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const result = yield prisma_1.default.$transaction((trans) => __awaiter(void 0, void 0, void 0, function* () {
        const adminDelete = yield trans.admin.update({
            where: {
                id: id,
            },
            data: { isDeleted: true },
        });
        yield trans.user.update({
            where: {
                email: adminDelete.email,
            },
            data: { status: client_1.UserStatus.DELETED },
        });
        return adminDelete;
    }));
    return result;
});
exports.adminServices = {
    getAllAdmin,
    getSingleAdmin,
    updateAdmin,
    deleteAdmin,
    softDeleteAdmin,
};
