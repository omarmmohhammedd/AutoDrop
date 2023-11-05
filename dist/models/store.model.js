"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    logo: { type: String, default: null, trim: true },
    name: { type: String, default: null, trim: true },
    username: { type: String, default: null, trim: true },
    website: { type: String, default: null, trim: true },
    tax_number: { type: String, default: null, trim: true },
    commercial_number: { type: String, default: null, trim: true },
    merchant: { type: String, default: null, trim: true },
    installation_date: { type: Date, default: null, trim: true },
    extension: { type: String, default: null, ref: "Extension", trim: true },
    userId: { type: String, default: null, ref: "User", trim: true },
}, { timestamps: true });
const Store = (0, mongoose_1.model)("Store", schema, "stores");
exports.Store = Store;
