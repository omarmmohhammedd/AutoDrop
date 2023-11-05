"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extension = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const schema = new mongoose_1.Schema({
    type: { type: String, default: "salla", trim: true },
    appId: { type: String, default: null, trim: true },
    access_token: { type: String, default: null, trim: true },
    refresh_token: { type: String, default: null, trim: true },
    expires: { type: String, default: null, trim: true },
    client_id: { type: String, default: null, trim: true },
    client_secret: { type: String, default: null, trim: true },
    client_api_key: { type: String, default: null, trim: true },
    name: { type: String, default: null, trim: true },
    baseUrl: { type: String, default: null, trim: true },
    logo: { type: String, default: null, trim: true },
    details: { type: String, default: null, trim: true },
    webhookSignature: { type: String, default: null, trim: true },
}, { timestamps: true });
schema.index({ "$**": "text" });
schema.plugin(mongoose_paginate_v2_1.default);
const Extension = (0, mongoose_1.model)("Extension", schema, "extensions");
exports.Extension = Extension;
