"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
class BaseApi {
    send(res, result, code) {
        const statusCode = (0, http_status_codes_1.getStatusCode)(http_status_codes_1.ReasonPhrases[code || "OK"]);
        let response = {
            status: statusCode,
            message: "Process completed successful",
            result,
        };
        return res.status(statusCode).json(response);
    }
}
exports.default = BaseApi;
