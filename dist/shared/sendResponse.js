"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, jsonData) => {
    return res.status(jsonData.statusCode).json({
        success: jsonData.success,
        message: jsonData.message,
        meta: (jsonData === null || jsonData === void 0 ? void 0 : jsonData.meta) || null || undefined,
        data: (jsonData === null || jsonData === void 0 ? void 0 : jsonData.data) || null || undefined,
    });
};
exports.default = sendResponse;
