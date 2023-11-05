"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const options = {
    status: {
        type: String,
        default: null,
    },
    tranRef: {
        type: String,
        default: null,
    },
    amount: {
        type: Number,
        integer: true,
        default: null,
    },
    user: {
        type: mongoose_1.Types.ObjectId,
        default: null,
        ref: "User",
    },
    plan: {
        type: mongoose_1.Types.ObjectId,
        default: null,
        ref: "Plan",
    },
    order: {
        type: mongoose_1.Types.ObjectId,
        default: null,
        ref: "Order",
    },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
const Transaction = (0, mongoose_1.model)("Transaction", schema, "transactions");
exports.Transaction = Transaction;
