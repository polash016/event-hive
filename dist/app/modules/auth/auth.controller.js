'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {}
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p]
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]]
      }
    return t
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.authController = void 0
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require('http-status'))
const catchAsync_1 = __importDefault(require('../../../shared/catchAsync'))
const auth_service_1 = require('./auth.service')
const sendResponse_1 = __importDefault(require('../../../shared/sendResponse'))
const loginUser = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.authServices.loginUser(req.body)
    const { refreshToken } = result,
      other = __rest(result, ['refreshToken'])
    res.cookie('refreshToken', refreshToken, {
      secure: false, // true only in production
      httpOnly: true,
    })
    ;(0, sendResponse_1.default)(res, {
      statusCode: http_status_1.default.OK,
      success: true,
      message: 'User logged in successfully!',
      data: other,
    })
  }),
)
const googleCallback = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
      const { accessToken, refreshToken } = req.user
      // Set a secure HTTP-only cookie with the token
      res.cookie('refreshToken', refreshToken, {
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        httpOnly: true,
      })
      // Redirect to the frontend with additional user data in query params
      res.redirect(
        `http://localhost:3000/login/success?accessToken=${accessToken}`,
      )
    } else {
      // If authentication fails, redirect to the login page with an error message
      res.redirect(`http://localhost:3000/login`)
    }
  }),
)
// const googleCallback = catchAsync(async (req, res) => {
//   if (req.user) {
//     const { refreshToken } = req.user as GLoginRes
//     res.cookie('refreshToken', refreshToken, {
//       secure: false, // true only in production
//       httpOnly: true,
//     })
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'User logged in successfully!',
//       data: req.user,
//     })
//   } else {
//     sendResponse(res, {
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       success: false,
//       message: 'Not authorized',
//       data: null,
//     })
//   }
//   // const user = req?.user
//   // console.log('controller', user)
//   // // const result = await authServices.findOrCreateUser(user)
//   // // Handle the user object, e.g., create a session or return a JWT
//   // // res.redirect('/') // Redirect to your desired route after successful login
//   // sendResponse(res, {
//   //   statusCode: httpStatus.OK,
//   //   success: true,
//   //   message: 'User logged in successfully!',
//   //   data: user,
//   // })
// })
const refreshToken = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req);
    const { refreshToken } = req.cookies
    const result = yield auth_service_1.authServices.refreshToken(refreshToken)
    // const { accessToken } = result
    // res.cookie('refreshToken', accessToken, {
    //   secure: false, // true only in production
    //   httpOnly: true,
    // })
    ;(0, sendResponse_1.default)(res, {
      statusCode: http_status_1.default.OK,
      success: true,
      message: 'Access token generated successfully!',
      data: result,
    })
  }),
)
const changePassword = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
      yield auth_service_1.authServices.changePassword(req.user.email, req.body)
    }
    ;(0, sendResponse_1.default)(res, {
      statusCode: http_status_1.default.OK,
      success: true,
      message: 'Password changed successfully!',
      data: null,
    })
  }),
)
const forgotPassword = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield auth_service_1.authServices.forgotPassword(req.body)
    ;(0, sendResponse_1.default)(res, {
      statusCode: http_status_1.default.OK,
      success: true,
      message: 'Check your mail!',
      data: null,
    })
  }),
)
const resetPassword = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization || ''
    yield auth_service_1.authServices.resetPassword(token, req.body)
    ;(0, sendResponse_1.default)(res, {
      statusCode: http_status_1.default.OK,
      success: true,
      message: 'Password changed successfully!',
      data: null,
    })
  }),
)
exports.authController = {
  loginUser,
  googleCallback,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
}
