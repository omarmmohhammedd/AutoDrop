"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const mongoose_1 = require("mongoose");
const options = {
    event: { type: String, default: null, trim: true },
    body: { type: String, default: null, trim: true },
    status: { type: String, default: null, trim: true },
    method: { type: String, default: null, trim: true },
    others: { type: String, default: null, trim: true },
    merchant: { type: String, default: null, ref: "User", trim: true },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
const Log = (0, mongoose_1.model)("Log", schema, "logs");
exports.Log = Log;
