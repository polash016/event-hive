'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.AuthRoutes = void 0
const express_1 = __importDefault(require('express'))
const auth_controller_1 = require('./auth.controller')
const auth_1 = __importDefault(require('../../middlewares/auth'))
const client_1 = require('@prisma/client')
const passport_1 = __importDefault(require('passport'))
const router = express_1.default.Router()
router.post('/login', auth_controller_1.authController.loginUser)
router.post('/refresh-token', auth_controller_1.authController.refreshToken)
router.get('/success', auth_controller_1.authController.googleCallback)
router.get(
  '/google',
  passport_1.default.authenticate('google', { scope: ['profile', 'email'] }),
)
router.get(
  '/google/callback',
  passport_1.default.authenticate('google', {
    // successRedirect: '/api/v1/auth/success',
    failureRedirect: 'http://localhost:3000/login',
  }),
  auth_controller_1.authController.googleCallback,
)
router.post(
  '/change-password',
  (0, auth_1.default)(
    client_1.UserRole.ATTENDEE,
    client_1.UserRole.ORGANIZER,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
  ),
  auth_controller_1.authController.changePassword,
)
router.post('/forgot-password', auth_controller_1.authController.forgotPassword)
router.post('/reset-password', auth_controller_1.authController.resetPassword)
exports.AuthRoutes = router
