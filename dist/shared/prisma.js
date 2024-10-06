"use strict";
// import { PrismaClient } from "@prisma/client";
Object.defineProperty(exports, "__esModule", { value: true });
// const prisma = new PrismaClient();
// export default prisma;
const client_1 = require("@prisma/client");
// const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
// const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: ['query', 'info', 'warn', 'error'],
//   })
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
const prisma = new client_1.PrismaClient();
exports.default = prisma;
