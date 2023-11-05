"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyToken = exports.GenerateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const key = process.env.JWT_SECRET;
function GenerateToken(data) {
    let result;
    result = (0, jsonwebtoken_1.sign)(data, key, { expiresIn: "1d" });
    return result;
}
exports.GenerateToken = GenerateToken;
function VerifyToken(token) {
    return new Promise((resolve, reject) => {
        let result;
        let expired = false;
        (0, jsonwebtoken_1.verify)(token, key, (error, result) => {
            if (error)
                return reject("JWT expired, re-login please");
            if (!result)
                return reject("There is not result found!");
            expired = new Date().getTime() > new Date(result.exp * 1000).getTime();
            if (expired)
                return reject("Expired");
            resolve(result);
        });
    });
}
exports.VerifyToken = VerifyToken;
