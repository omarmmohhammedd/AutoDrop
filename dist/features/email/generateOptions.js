"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../responses/messages/controller"));
function generateOptions(emails, template, keys) {
    const message = (0, controller_1.default)(template, keys);
    const options = {
        to: emails,
        subject: "",
        html: message,
    };
    return options;
}
exports.default = generateOptions;
