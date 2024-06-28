import { NextFunction, Request, Response } from "express";
import config from "../config";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { Secret } from "jsonwebtoken";
import AppError from "../errors/AppError";
import httpStatus from "http-status";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
      }

      const verifyUser = jwtHelpers.verifyToken(
        token,
        config.jwt_secret as Secret
      );

      req.user = verifyUser;

      if (roles.length && !roles.includes(verifyUser.role)) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Forbidden");
      }
      next();
    } catch (error: any) {
      next(error);
    }
  };
};

export default auth;
