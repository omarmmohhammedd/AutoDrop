"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const options = {
    order_id: { type: String, default: null, trim: true },
    reference_id: { type: String, default: null, trim: true },
    date: { type: Map, default: null },
    payment_method: { type: String, default: null, trim: true },
    currency: { type: String, default: null, trim: true },
    amounts: { type: Map, default: null },
    urls: { type: Map, default: null },
    shipping: { type: Map, default: null },
    customer: { type: Map, default: null },
    bank: { type: Map, default: null },
    items: { type: Array, default: null },
    status: {
        type: String,
        default: null,
        trim: true,
        enums: [
            "created",
            "in_review",
            "in_transit",
            "in_progress",
            "canceled",
            "completed",
        ],
    },
    meta: { type: Map, default: null },
    status_track: { type: Array },
    merchant: { type: String, default: null, trim: true },
    notes: { type: String, default: null, trim: true },
    tracking_order_id: { type: mongoose_1.Schema.Types.Mixed, default: null },
    shippingFee: { type: Number, default: 0 },
    paid: { type: Boolean, default: false }
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
const Order = (0, mongoose_1.model)("Order", schema, "orders");
exports.Order = Order;
