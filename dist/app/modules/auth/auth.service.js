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
exports.authServices = void 0;
const jwtHelpers_1 = require("./../../../helpers/jwtHelpers");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const sendEmail_1 = __importDefault(require("../../../helpers/sendEmail"));
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isPasswordCorrect = yield bcrypt_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
    if (!isPasswordCorrect) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Incorrect Password');
    }
    const jwtPayload = { email: user.email, role: user.role };
    const token = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt_secret, config_1.default.jwt_secret_expires);
    const refreshToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt_refresh, config_1.default.jwt_refresh_expires);
    return {
        accessToken: token,
        refreshToken,
    };
});
const findOrCreateUser = (profile) => __awaiter(void 0, void 0, void 0, function* () {
    const email = profile.emails[0].value;
    //profile.displayName
    //profile.picture
    //profile.name.familyName + ' ' + profile.name.givenName
    // if (!user) {
    //   user = await prisma.user.create({
    //     data: {
    //       email,
    //       name: profile.displayName,
    //       googleId: profile.id,
    //     },
    //   })
    // }
    const user = yield prisma_1.default.user.findUnique({ where: { email } });
    if (user) {
        const jwtPayload = { email: user.email, role: user.role };
        const token = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt_secret, config_1.default.jwt_secret_expires);
        const refreshToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt_refresh, config_1.default.jwt_refresh_expires);
        return {
            googleId: user.googleId,
            accessToken: token,
            refreshToken,
        };
    }
    const createdUser = yield prisma_1.default.$transaction((transClient) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield transClient.user.create({
            data: {
                email,
                googleId: profile.id,
                role: client_1.UserRole.ATTENDEE,
            },
        });
        yield transClient.attendee.create({
            data: {
                email,
                name: `${profile.name.givenName} ${profile.name.familyName ? profile.name.familyName : ''}`,
                profilePhoto: profile === null || profile === void 0 ? void 0 : profile.photos[0].value,
            },
        });
        return user;
    }));
    const jwtPayload = { email: createdUser.email, role: createdUser.role };
    const token = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt_secret, config_1.default.jwt_secret_expires);
    const refreshToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt_refresh, config_1.default.jwt_refresh_expires);
    return {
        googleId: createdUser.googleId,
        accessToken: token,
        refreshToken,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let decodedData;
    try {
        decodedData = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt_refresh);
    }
    catch (err) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Not Authorized');
    }
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({ email: user.email, role: user.role }, config_1.default.jwt_secret, config_1.default.jwt_secret_expires);
    return {
        accessToken,
    };
});
const changePassword = (email, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isPasswordMatched = yield bcrypt_1.default.compare(payload.oldPassword, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Wrong Password');
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload.newPassword, Number(config_1.default.salt_rounds));
    const updatePassword = yield prisma_1.default.user.update({
        where: {
            email,
        },
        data: {
            password: hashedPassword,
        },
    });
    return updatePassword;
});
const forgotPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const token = jwtHelpers_1.jwtHelpers.generateToken({ email: user.email, role: user.role }, config_1.default.reset_pass_secret, config_1.default.reset_pass_expires);
    const resetPassLink = `${config_1.default.reset_pass_link}?id=${user.id}&token=${token}`;
    yield (0, sendEmail_1.default)(user.email, `
  <div className='mx-auto text-center'>
  <p>Dear User,<p/>
  <p>Please click on the link below to reset your password
  <a href=${resetPassLink}>
  <button>Reset Password<button/>
  </a> 
  </p>  
  </div>
    `);
});
const resetPassword = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: payload.id,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isValidToken = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.reset_pass_secret);
    if (!isValidToken) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Invalid token');
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload.password, Number(config_1.default.salt_rounds));
    const updatePassword = yield prisma_1.default.user.update({
        where: {
            id: payload.id,
        },
        data: {
            password: hashedPassword,
        },
    });
    return updatePassword;
});
exports.authServices = {
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
    findOrCreateUser,
};
