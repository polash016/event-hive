"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get('/all-payment', (0, auth_1.default)(client_1.UserRole.ATTENDEE), payment_controller_1.paymentController.getAllPayments);
router.post('/init/:eventId', (0, auth_1.default)(client_1.UserRole.ATTENDEE), payment_controller_1.paymentController.initPayment);
router.post('/ipn', payment_controller_1.paymentController.validatePayment);
router.post('/create-checkout-session', (0, auth_1.default)(client_1.UserRole.ATTENDEE), payment_controller_1.paymentController.checkoutPaymentSession);
router.post('/payment-success', (0, auth_1.default)(client_1.UserRole.ATTENDEE), payment_controller_1.paymentController.paymentSuccess);
exports.PaymentRoutes = router;
