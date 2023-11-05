"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Option = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const options = {
    name: { type: String, default: null, trim: true },
    productId: { type: mongoose_1.Types.ObjectId, ref: "Product", default: null },
    values: { type: Array, default: [] },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
schema.index({ "$**": "text" });
schema.plugin(mongoose_paginate_v2_1.default);
const Option = (0, mongoose_1.model)("Option", schema, "options");
exports.Option = Option;
