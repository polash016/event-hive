import { Request, Response } from "express";
import { userService } from "./user.service";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../shared/pick";
import { userSearchableField } from "./user.const";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body)
  const result = await userService.createAdmin(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin Created successfully!",
    data: result,
  });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createDoctor(req);

  console.log({result})

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor Created successfully!",
    data: result,
  });
});

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createPatient(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient Created successfully!",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const filters = pick(req.query, userSearchableField);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await userService.getAllUsers(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User data fetched!",
    data: result.data,
    meta: result.meta,
  });
});

const changeProfileStatus = catchAsync(async (req, res) => {
  const {id} = req.params

  const result = await userService.changeStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Status Changed",
    data: result.data,
  });
});


const getMyProfile = catchAsync(async (req, res) => {

  const result = await userService.getProfile(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {

  const result = await userService.updateProfile(req.user, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});


export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUsers,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile
};
