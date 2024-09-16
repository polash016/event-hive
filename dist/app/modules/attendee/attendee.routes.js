"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendeeRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const attendee_controller_1 = require("./attendee.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const attendee_validation_1 = require("./attendee.validation");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), attendee_controller_1.attendeeController.getAttendee);
router.get('/:id', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), attendee_controller_1.attendeeController.getSingleAttendee);
router.patch('/:id', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, validateRequest_1.default)(attendee_validation_1.AttendeeValidation.updateAttendee), attendee_controller_1.attendeeController.updateSingleAttendee);
router.delete('/soft/:id', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), attendee_controller_1.attendeeController.deleteSingleAttendee);
exports.AttendeeRoutes = router;
