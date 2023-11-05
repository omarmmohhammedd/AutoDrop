"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckValidationSchema = void 0;
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const express_validator_1 = require("express-validator");
function CheckValidationSchema(req, res, next) {
    try {
        let result = {};
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty())
            return next();
        for (const err of errors.array()) {
            const item = err;
            const key = item.param;
            const isIncluded = Object.prototype.hasOwnProperty.call(result, key);
            if (isIncluded)
                continue;
            result[item.param] = item.msg;
        }
        throw new ApiError_1.default("UnprocessableEntity", result);
    }
    catch (error) {
        next(error);
    }
}
exports.CheckValidationSchema = CheckValidationSchema;
