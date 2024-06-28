import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { authServices } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body);

  const { refreshToken, ...other } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: false, // true only in production
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully!",
    data: other,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  // console.log(req);
  const { refreshToken } = req.cookies;

  const result = await authServices.refreshToken(refreshToken);

  // const { refreshToken, ...other } = result;

  // res.cookie("refreshToken", refreshToken, {
  //   secure: false, // true only in production
  //   httpOnly: true,
  // });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token generated successfully!",
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  await authServices.changePassword(req.user.email, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully!",
    data: null,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  await authServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Check your mail!",
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization || "";

  await authServices.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully!",
    data: null,
  });
});

export const authController = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
