import jwt, { Secret } from "jsonwebtoken";
import { jwtHelpers } from "./../../../helpers/jwtHelpers";
import bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import { UserStatus } from "@prisma/client";
import config from "../../config";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import sendEmail from "../../../helpers/sendEmail";

const loginUser = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
      status: UserStatus.ACTIVE,
    },
  });

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  console.log(isPasswordCorrect);

  if (!isPasswordCorrect) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const jwtPayload = { email: user.email, role: user.role };

  const token = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt_secret as Secret,
    config.jwt_secret_expires as string
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt_refresh as Secret,
    config.jwt_refresh_expires as string
  );

  console.log(token);

  return {
    accessToken: token,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(token, config.jwt_refresh as string);

    console.log(decodedData);
  } catch (err) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Not Authorized");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    { email: user.email, role: user.role },
    config.jwt_secret as string,
    config.jwt_secret_expires as string
  );

  return {
    accessToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const changePassword = async (
  email: string,
  payload: { oldPassword: string; newPassword: string }
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
      status: UserStatus.ACTIVE,
    },
  });
  const isPasswordMatched = await bcrypt.compare(
    payload.oldPassword,
    user.password
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Wrong Password");
  }

  
  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.salt_rounds) as number
  );

  const updatePassword = await prisma.user.update({
    where: {
      email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });
  return updatePassword;
};

const forgotPassword = async (payload: { email: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const token = jwtHelpers.generateToken(
    { email: user.email, role: user.role },
    config.reset_pass_secret as Secret,
    config.reset_pass_expires as string
  );

  const resetPassLink = `${config.reset_pass_link}?id=${user.id}&token=${token}`;

  await sendEmail(
    user.email,
    `
  <div className='mx-auto text-center'>
  <p>Dear User,<p/>
  <p>Please click on the link below to reset your password
  <a href=${resetPassLink}>
  <button>Reset Password<button/>
  </a> 
  </p>  
  </div>
    `
  );
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.reset_pass_secret as Secret
  );

  if (!isValidToken) {
    throw new AppError(httpStatus.FORBIDDEN, "Invalid token");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds) as number
  );

  const updatePassword = await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password: hashedPassword,
    },
  });
  return updatePassword;
};

export const authServices = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
