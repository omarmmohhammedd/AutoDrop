"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const options = {
    order_id: { type: String, default: null, trim: true },
    reference_id: { type: String, default: null, trim: true },
    currency: { type: String, default: null, trim: true },
    total: { type: Number, default: null, trim: true },
    subTotal: { type: Number, default: null, trim: true },
    urls: { type: Map, default: null },
    shipping: { type: Map, default: null },
    customer: { type: Map, default: null },
    items: [
        {
            productId: {
                type: mongoose_1.Types.ObjectId,
                default: null,
                ref: "ProductItem",
            },
            optionIds: [
                {
                    type: mongoose_1.Types.ObjectId,
                    default: null,
                    ref: "OptionItem",
                },
            ],
            thumbnail: {
                type: String,
                default: null,
                trim: true,
            },
        },
    ],
    status: {
        type: String,
        default: null,
        trim: true,
        enums: [
            "created",
            "in_review",
            "in_transit",
            "canceled",
            "refunded",
            "completed",
        ],
    },
    meta: { type: Map, default: null },
    status_track: { type: Array },
    userId: { type: mongoose_1.Types.ObjectId, default: null, ref: "User", trim: true },
    notes: { type: String, default: null, trim: true },
    tracking_order_id: { type: String, default: null },
    products_shipping_services: {
        type: Array,
        default: null,
    },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
schema.index({ "$**": "text" });
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Order = (0, mongoose_1.model)("Order", schema, "orders");
exports.Order = Order;
