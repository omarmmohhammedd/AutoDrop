import { body, ValidationChain } from "express-validator";

export const CheckAccessTokenData = [
  body("code")
    .exists()
    .withMessage("Authentication code is required")
    .isString()
    .withMessage("Authentication code should be typeof string")
    .notEmpty()
    .withMessage("Empty value"),
  body("secret")
    .exists()
    .withMessage("Secret key is required")
    .isString()
    .withMessage("Secret key should be typeof string")
    .notEmpty()
    .withMessage("Empty value"),

  body("app_key")
    .exists()
    .withMessage("App key is required")
    .notEmpty()
    .withMessage("Empty value"),
] satisfies ValidationChain[];
