"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
function SallaRequest({ url, method, data, token, }) {
    const options = {
        baseURL: process.env.SALLA_ENDPOINT,
        url,
        method,
        data,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
    };
    return (0, axios_1.default)(options);
}
exports.default = SallaRequest;
