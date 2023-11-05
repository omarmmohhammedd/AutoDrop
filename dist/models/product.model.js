"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const options = {
    name: { type: String, default: null, trim: true },
    description: { type: String, default: null, trim: true },
    price: { type: Number, default: 0, integer: true },
    main_price: { type: Number, default: 0, integer: true },
    vendor_commission: { type: Number, default: 0, integer: true },
    vendor_price: { type: Number, default: 0, integer: true },
    quantity: { type: Number, default: 0, integer: true },
    sku: { type: String, default: null, trim: true },
    images: { type: Array, default: [] },
    options: { type: Array, default: [] },
    metadata_title: { type: String, default: null, trim: true },
    metadata_description: { type: String, default: null, trim: true },
    product_type: { type: String, default: null, trim: true },
    original_product_id: {
        type: String || Number,
        default: null,
        trim: true,
        integer: true,
    },
    salla_product_id: {
        type: String || Number,
        default: null,
        trim: true,
        integer: true,
    },
    merchant: { type: String, default: null, ref: "User", trim: true },
    require_shipping: {
        type: Boolean,
        default: true,
    },
    shipping: {
        name: {
            type: String,
        },
        price: {
            type: Number,
        },
    },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
schema.index({ "$**": "text" });
const Product = (0, mongoose_1.model)("Product", schema, "products");
exports.Product = Product;
