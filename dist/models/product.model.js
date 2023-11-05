"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const options = {
    name: { type: String, default: null, trim: true },
    description: { type: String, default: null, trim: true },
    images: { type: Array, default: [] },
    options: { type: Array, default: [], ref: "Option" },
    metadata_title: { type: String, default: null, trim: true },
    metadata_description: { type: String, default: null, trim: true },
    original_product_id: {
        type: String || Number,
        default: null,
        trim: true,
        integer: true,
    },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
schema.index({ "$**": "text" });
schema.plugin(mongoose_paginate_v2_1.default);
const Product = (0, mongoose_1.model)("Product", schema, "products");
exports.Product = Product;
