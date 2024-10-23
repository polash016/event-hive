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
/* eslint-disable @typescript-eslint/no-explicit-any */
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = __importDefault(require("../../app/config"));
const auth_service_1 = require("../../app/modules/auth/auth.service");
// import prisma from '../../shared/prisma'
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: config_1.default.google_client_id, //process.env.GOOGLE_CLIENT_ID!,
    clientSecret: config_1.default.google_client_secret, // process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: 'https://event-hive-two.vercel.app/api/v1/auth/google/callback',
    scope: ['profile', 'email'],
}, (accessToken, refreshToken, profile, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield auth_service_1.authServices.findOrCreateUser(profile);
        callback(null, user);
    }
    catch (err) {
        callback(err, false);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => __awaiter(void 0, void 0, void 0, function* () {
    //   try {
    //     if (typeof id === 'string') {
    //       const user = await prisma.user.findUnique({ where: { id } })
    //       done(null, user)
    //     }
    //   } catch (err) {
    // }
    done(null, user || null);
}));
