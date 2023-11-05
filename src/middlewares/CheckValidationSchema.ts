import ApiError from "../errors/ApiError";
import { NextFunction, Request, Response } from "express";
import { Result, ValidationError, validationResult } from "express-validator";

export function CheckValidationSchema(
  req: Request ,
  res: Response,
  next: NextFunction
) {
  try {
    let result: any = {};
    const errors: Result = validationResult(req);
    if (errors.isEmpty()) return next();

    for (const err of errors.array()) {
      const item: ValidationError = err;
      const key = item.param;
      const isIncluded = Object.prototype.hasOwnProperty.call(result, key);
      if (isIncluded) continue;
      result[item.param] = item.msg;
    }
    console.log(result)
    throw new ApiError("UnprocessableEntity", result);
  } catch (error) {
    next(error);
  }
}
