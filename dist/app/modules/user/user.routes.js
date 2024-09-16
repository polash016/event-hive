"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const fileUploader_1 = require("../../../helpers/fileUploader");
const user_validation_1 = require("./user.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(client_1.UserRole.ATTENDEE, client_1.UserRole.ORGANIZER, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), user_controller_1.userController.getAllUsers);
router.get('/my', (0, auth_1.default)(client_1.UserRole.ATTENDEE, client_1.UserRole.ORGANIZER, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), user_controller_1.userController.getMyProfile);
router.post('/create-admin', 
// auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
fileUploader_1.fileUploader.upload.single('file'), (req, res, next) => {
    req.body = user_validation_1.userValidation.createAdmin.parse(JSON.parse(req.body.data));
    return user_controller_1.userController.createAdmin(req, res, next);
});
router.post('/create-organizer', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), fileUploader_1.fileUploader.upload.single('file'), (req, res, next) => {
    req.body = user_validation_1.userValidation.createOrganizer.parse(JSON.parse(req.body.data));
    return user_controller_1.userController.createOrganizer(req, res, next);
});
router.post('/create-attendee', 
// auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
fileUploader_1.fileUploader.upload.single('file'), (req, res, next) => {
    req.body = user_validation_1.userValidation.createAttendee.parse(JSON.parse(req.body.data));
    return user_controller_1.userController.createAttendee(req, res, next);
});
router.patch('/:id/status', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, validateRequest_1.default)(user_validation_1.userValidation.updateProfileStatus), user_controller_1.userController.changeProfileStatus);
router.patch('/update-profile', (0, auth_1.default)(client_1.UserRole.ATTENDEE, client_1.UserRole.ORGANIZER, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), fileUploader_1.fileUploader.upload.single('file'), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    return user_controller_1.userController.updateMyProfile(req, res, next);
});
exports.userRoutes = router;
