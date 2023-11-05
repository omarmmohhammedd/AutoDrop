"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const options = {
    name: { type: String, default: null, trim: true },
    email: {
        type: String,
        default: null,
        trim: true,
        unique: true,
    },
    mobile: { type: String, default: null, trim: true },
    password: { type: String, default: null, trim: true },
    avatar: { type: String, default: null, trim: true },
    pt_customer_id: { type: String, default: null, trim: true },
    userType: {
        type: String,
        default: null,
        trim: true,
        enum: ["admin", "vendor"],
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    store: {
        type: mongoose_1.Types.ObjectId,
        ref: "Store",
        default: null,
    },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
schema.index({ "$**": "text" });
schema.plugin(mongoose_paginate_v2_1.default);
const User = (0, mongoose_1.model)("User", schema, "users");
exports.User = User;
