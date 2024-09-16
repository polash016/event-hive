"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const organizer_controller_1 = require("./organizer.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const organizer_validation_1 = require("./organizer.validation");
const router = express_1.default.Router();
router.get('/', 
// auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
organizer_controller_1.organizerController.getOrganizers);
router.get('/:id', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), organizer_controller_1.organizerController.getSingleOrganizer);
router.patch('/:id', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, validateRequest_1.default)(organizer_validation_1.OrganizerValidation.updateOrganizer), organizer_controller_1.organizerController.updateSingleOrganizer);
router.delete('/:id', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), organizer_controller_1.organizerController.deleteSingleOrganizer);
exports.OrganizerRoutes = router;
