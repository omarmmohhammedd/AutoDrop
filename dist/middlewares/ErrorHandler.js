"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const lodash_1 = require("lodash");
function ErrorHandler(error, req, res, next) {
    console.log(error);
    const err = new http_errors_1.default[error.code || "404"](error.message);
    const globalErrors = (0, lodash_1.pick)(err, [
        "statusCode",
        "message",
        "stack",
    ]);
    const developmentError = globalErrors;
    const productionError = globalErrors;
    res
        .status(err.statusCode)
        .send(process.env.NODE_ENV === "production" ? productionError : developmentError);
    next();
}
exports.ErrorHandler = ErrorHandler;
