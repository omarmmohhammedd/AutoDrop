import { Request, Response, NextFunction } from "express";
import httpError, { HttpError } from "http-errors";
import { pick } from "lodash";

export function ErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log(error);
  const err = new httpError[error.code || "404"](error.message);

  const globalErrors = pick(err, [
    "statusCode",
    "message",
    "stack",
  ]) satisfies Pick<HttpError, "message" | "stack" | "statusCode">;

  const developmentError = globalErrors;
  const productionError = globalErrors satisfies Omit<
    typeof globalErrors,
    "stack"
  >;

  res
    .status(err.statusCode)
    .send(
      process.env.NODE_ENV === "production" ? productionError : developmentError
    );

  next();
}
