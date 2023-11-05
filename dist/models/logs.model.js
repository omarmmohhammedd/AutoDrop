"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    type: { type: String, default: "default", trim: true },
    details: { type: String, default: null, trim: true },
    userId: { type: String, default: null, ref: "User", trim: true },
}, { timestamps: true });
const Log = (0, mongoose_1.model)("Log", schema, "logs");
exports.Log = Log;
