"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plan = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const options = {
    name: { type: String, default: null, trim: true },
    description: { type: String, default: null, trim: true },
    discount_price: { type: Number, default: null, trim: true },
    discount_type: { type: String, default: null, trim: true },
    discount_value: { type: Number, default: null, trim: true },
    orders_limit: { type: Number || null, default: null, trim: true },
    products_limit: { type: Number || null, default: null, trim: true },
    is_default: { type: Boolean, default: false, trim: true },
    price: { type: Number, default: null, trim: true },
    services: { type: Array, default: null, trim: true },
    is_monthly: { type: Boolean, default: true },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
schema.index({ "$**": "text" });
schema.plugin(mongoose_paginate_v2_1.default);
const Plan = (0, mongoose_1.model)("Plan", schema, "plans");
exports.Plan = Plan;
