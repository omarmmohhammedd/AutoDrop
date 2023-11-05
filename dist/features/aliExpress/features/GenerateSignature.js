"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateSign = exports.GenerateValues = void 0;
const crypto_1 = require("crypto");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function GenerateValues(params) {
    const keys = (obj) => Object.keys(obj).sort();
    const GenerateParams = (obj) => keys(obj)
        .map((key) => {
        const item = obj[key];
        if (item instanceof Object) {
            // return key + encodeURIComponent(JSON.stringify(item));
            return key + JSON.stringify(item);
        }
        return key + item;
    })
        .join("");
    const string = GenerateParams(params);
    console.log(string);
    return string;
}
exports.GenerateValues = GenerateValues;
function GenerateSign(value, secret) {
    const digest = (0, crypto_1.createHmac)("sha256", secret).update(value).digest("hex");
    return digest.toUpperCase();
}
exports.GenerateSign = GenerateSign;
