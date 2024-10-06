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
exports.default = handler;
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./shared/prisma"));
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Ensure Prisma is connected
            yield prisma_1.default.$connect();
            yield new Promise((resolve, reject) => {
                (0, app_1.default)(req, res, (result) => {
                    if (result instanceof Error) {
                        return reject(result);
                    }
                    return resolve(result);
                });
            });
        }
        catch (error) {
            console.error('Server error:', error);
            res
                .status(500)
                .json({ error: 'Internal Server Error', details: error.message });
        }
        finally {
            // Disconnect Prisma to prevent connection pool exhaustion
            yield prisma_1.default.$disconnect();
        }
    });
}
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app_1.default.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}
