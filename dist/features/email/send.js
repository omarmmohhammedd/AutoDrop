"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const nodemailer_1 = require("nodemailer");
const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } = process.env;
async function SendEmail(options) {
    return new Promise((resolve, reject) => {
        try {
            let transporter, info;
            const emailOptions = {
                host: EMAIL_HOST,
                port: EMAIL_PORT,
                auth: {
                    user: EMAIL_USERNAME,
                    pass: EMAIL_PASSWORD,
                },
            };
            transporter = (0, nodemailer_1.createTransport)(emailOptions);
            transporter.verify(async function (err, success) {
                console.log(err);
                if (err)
                    return reject(new ApiError_1.default("InternalServerError"));
                info = await transporter.sendMail({
                    from: '"Autodrop" <' + EMAIL_USERNAME + ">",
                    ...options,
                });
                resolve(info);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.default = SendEmail;
