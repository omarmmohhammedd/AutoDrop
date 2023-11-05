"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductItem = void 0;
const mongoose_1 = require("mongoose");
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const options = {
    productId: { type: mongoose_1.Types.ObjectId, ref: "Product", default: null },
    userId: { type: mongoose_1.Types.ObjectId, ref: "User", default: null },
    options: { type: Array, default: [] },
    store_product_id: { type: String, default: null, trim: true },
    vendor_commission: { type: Number, default: 0, integer: true },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
schema.index({ "$**": "text" });
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const ProductItem = (0, mongoose_1.model)("ProductItem", schema, "productItems");
exports.ProductItem = ProductItem;
