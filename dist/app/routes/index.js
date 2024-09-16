"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../modules/user/user.routes");
const admin_routes_1 = require("../modules/admin/admin.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const event_routes_1 = require("../modules/event/event.routes");
const attendee_routes_1 = require("../modules/attendee/attendee.routes");
const organizer_routes_1 = require("../modules/organizer/organizer.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const category_routes_1 = require("../modules/category/category.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/user',
        route: user_routes_1.userRoutes,
    },
    {
        path: '/admin',
        route: admin_routes_1.AdminRoutes,
    },
    {
        path: '/auth',
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: '/attendee',
        route: attendee_routes_1.AttendeeRoutes,
    },
    {
        path: '/organizer',
        route: organizer_routes_1.OrganizerRoutes,
    },
    {
        path: '/event',
        route: event_routes_1.EventRoutes,
    },
    {
        path: '/payment',
        route: payment_routes_1.PaymentRoutes,
    },
    {
        path: '/category',
        route: category_routes_1.CategoryRoutes,
    },
];
moduleRoutes.forEach(route => {
    router.use(route.path, route.route);
});
exports.default = router;
