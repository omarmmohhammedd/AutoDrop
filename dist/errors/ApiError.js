"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.message = message;
        this.code = code;
    }
}
exports.default = ApiError;
