"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const event_controller_1 = require("./event.controller");
// import validateRequest from '../../middlewares/validateRequest'
// import { EventValidation } from './event.validation'
const fileUploader_1 = require("../../../helpers/fileUploader");
const router = express_1.default.Router();
router.get('/my-events', (0, auth_1.default)(client_1.UserRole.ATTENDEE), event_controller_1.eventController.getMyEvents);
router.get('/', 
// auth(
//   UserRole.ADMIN,
//   UserRole.SUPER_ADMIN,
//   UserRole.ORGANIZER,
//   UserRole.ATTENDEE,
// ),
event_controller_1.eventController.getAllEvent);
router.get('/:id', 
// auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANIZER),
event_controller_1.eventController.getSingleEvent);
router.delete('/:id', 
// auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANIZER),
event_controller_1.eventController.deleteEvent);
router.post('/create-event', (0, auth_1.default)(client_1.UserRole.ORGANIZER, client_1.UserRole.SUPER_ADMIN), fileUploader_1.fileUploader.upload.fields([
    { name: 'events', maxCount: 10 },
    { name: 'guestImg', maxCount: 1 },
]), (req, res, next) => {
    req.body = JSON.parse(req.body.data); //EventValidation.createEvent.parse(JSON.parse(req.body.data))
    return event_controller_1.eventController.createEvent(req, res, next);
});
router.patch('/:id', (0, auth_1.default)(client_1.UserRole.ORGANIZER, client_1.UserRole.SUPER_ADMIN), fileUploader_1.fileUploader.upload.fields([
    { name: 'events', maxCount: 10 },
    { name: 'guestImg', maxCount: 1 },
]), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    return event_controller_1.eventController.updateEvent(req, res, next);
});
// router.delete(
//   '/soft/:id',
//   auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
//   eventController.deleteEvent,
// )
exports.EventRoutes = router;
