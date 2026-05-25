import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

/**
 * Reads the result of all express-validator checks that ran before this middleware.
 * If there are errors, throws an ApiError with all messages.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    [err.path]: err.msg,
  }));

  throw new ApiError(422, "Validation failed", extractedErrors);
};
