import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploader";
import { userValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.PATIENT,UserRole.DOCTOR,UserRole.ADMIN, UserRole.SUPER_ADMIN),
  userController.getAllUsers
);

router.get(
  "/my",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(userValidation.updateProfileStatus),
  userController.changeProfileStatus
);



router.post(
  "/create-admin",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createAdmin.parse(JSON.parse(req.body.data))
        return userController.createAdmin(req, res, next)
    }
);

router.post(
  "/create-doctor",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
      console.log(req.body)
        req.body = userValidation.createDoctor.parse(JSON.parse(req.body.data))
        return userController.createDoctor(req, res, next)
    }
);

router.post(
  "/create-patient",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createPatient.parse(JSON.parse(req.body.data))
        return userController.createPatient(req, res, next)
    }
);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(userValidation.updateProfileStatus),
  userController.changeProfileStatus
);

router.patch(
  "/update-profile",
  auth(UserRole.PATIENT,UserRole.DOCTOR,UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data)
        return userController.updateMyProfile(req, res, next)
    }
);


export const userRoutes = router;
