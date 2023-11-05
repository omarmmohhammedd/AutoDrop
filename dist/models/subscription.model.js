"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = require("mongoose");
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
schema.index({ "user.$**": "text" });
schema.index({ "plan.$**": "text" });
const Subscription = (0, mongoose_1.model)("Subscription", schema, "Subscriptions");
exports.Subscription = Subscription;
