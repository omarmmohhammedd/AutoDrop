"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionItem = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const options = {
    productId: { type: mongoose_1.Types.ObjectId, ref: "ProductItem", default: null },
    optionId: { type: mongoose_1.Types.ObjectId, ref: "Option", default: null },
    userId: { type: mongoose_1.Types.ObjectId, ref: "User", default: null },
    display_type: { type: String, default: "text", trim: true },
    store_option_id: { type: String, default: null, trim: true },
    values: { type: Array, default: [] },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
schema.index({ "$**": "text" });
schema.plugin(mongoose_paginate_v2_1.default);
const OptionItem = (0, mongoose_1.model)("OptionItem", schema, "optionsItem");
exports.OptionItem = OptionItem;
