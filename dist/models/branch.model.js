"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branch = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String, default: null, trim: true },
    address: { type: String, default: null, trim: true },
    postal_code: { type: String, default: null, trim: true },
    contacts: { type: String, default: null, trim: true },
    location: { type: Map, default: null, trim: true },
    street: { type: String, default: null, trim: true },
    country: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    userId: { type: String, default: null, ref: "User", trim: true },
}, { timestamps: true });
const Branch = (0, mongoose_1.model)("Branch", schema, "branches");
exports.Branch = Branch;
