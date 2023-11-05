"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const options = {
    orders_limit: { type: Number || null, default: null, trim: true },
    products_limit: { type: Number || null, default: null, trim: true },
    start_date: {
        type: Date,
        default: null,
    },
    expiry_date: {
        type: Date,
        default: null,
    },
    plan: {
        type: mongoose_1.Types.ObjectId,
        default: null,
        ref: "Plan",
    },
    user: {
        type: mongoose_1.Types.ObjectId,
        default: null,
        ref: "User",
    },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
schema.index({ "$**": "text" });
schema.plugin(mongoose_paginate_v2_1.default);
const Subscription = (0, mongoose_1.model)("Subscription", schema, "subscriptions");
exports.Subscription = Subscription;
