"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckAccessTokenData = void 0;
const express_validator_1 = require("express-validator");
exports.CheckAccessTokenData = [
    (0, express_validator_1.body)("code")
        .exists()
        .withMessage("Authentication code is required")
        .isString()
        .withMessage("Authentication code should be typeof string")
        .notEmpty()
        .withMessage("Empty value"),
    (0, express_validator_1.body)("secret")
        .exists()
        .withMessage("Secret key is required")
        .isString()
        .withMessage("Secret key should be typeof string")
        .notEmpty()
        .withMessage("Empty value"),
    (0, express_validator_1.body)("app_key")
        .exists()
        .withMessage("App key is required")
        .notEmpty()
        .withMessage("Empty value"),
];
