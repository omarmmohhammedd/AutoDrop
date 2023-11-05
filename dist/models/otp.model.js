"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP = void 0;
const mongoose_1 = require("mongoose");
const options = {
    value: {
        type: String,
        default: null,
    },
    user: {
        type: mongoose_1.Types.ObjectId,
        default: null,
        ref: "User",
    },
    createdAt: { type: Date, expires: "5m", default: Date.now },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
const OTP = (0, mongoose_1.model)("otp", schema, "OTPs");
exports.OTP = OTP;
