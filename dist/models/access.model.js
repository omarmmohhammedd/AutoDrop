"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    access_token: { type: String, default: null, trim: true },
    refresh_token: { type: String, default: null, trim: true },
    scope: { type: String, default: null, trim: true },
    expires: { type: Number, default: null, trim: true },
    store: { type: String, default: null, ref: "Store", trim: true },
    userId: { type: String, default: null, ref: "User", trim: true },
}, { timestamps: true });
const Token = (0, mongoose_1.model)("Token", schema, "tokens");
exports.Token = Token;
