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
exports.categoryServices = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const getAllCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.category.findMany({});
    const total = yield prisma_1.default.category.count({});
    return {
        meta: {
            total,
        },
        data: result,
    };
});
const createCategory = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield prisma_1.default.category.findFirst({
        where: {
            name: {
                contains: data.name,
                mode: 'insensitive',
            },
        },
    });
    if (category) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Category already exists');
    }
    const result = yield prisma_1.default.category.create({
        data,
    });
    return result;
});
const deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.category.findUniqueOrThrow({
        where: {
            id,
        },
    });
    yield prisma_1.default.eventCategory.deleteMany({
        where: {
            categoryId: id,
        },
    });
    // Now delete the category
    const result = yield prisma_1.default.category.delete({
        where: {
            id,
        },
    });
    return result;
});
exports.categoryServices = {
    getAllCategories,
    createCategory,
    deleteCategory,
};
