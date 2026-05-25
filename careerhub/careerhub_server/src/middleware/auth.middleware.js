/**
 * auth.middleware.js — JWT verification
 *
 * Bugs fixed vs original:
 *  1. TokenExpiredError was caught and re-thrown as generic "Invalid access token" — 
 *     users got no hint that their token had expired vs was malformed. Now we return
 *     distinct 401 messages so the client can act accordingly (refresh vs re-login).
 *  2. The outer try/catch swallowed ALL errors including DB errors; only JWT errors
 *     should be caught here — DB errors bubble up to the global error handler.
 */

import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request — no token provided");
  }

  let decodedToken;

  // FIX: distinguish between expired tokens and tampered/invalid tokens
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(
        401,
        "Access token has expired — please refresh your session"
      );
    }
    // JsonWebTokenError, NotBeforeError, or anything else
    throw new ApiError(401, "Invalid access token — please log in again");
  }

  // DB lookup is outside the JWT try/catch so DB errors surface correctly
  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!user) {
    throw new ApiError(401, "Invalid access token — user not found");
  }

  req.user = user;
  next();
});
