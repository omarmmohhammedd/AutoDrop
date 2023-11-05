"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Setting = void 0;
const mongoose_1 = require("mongoose");
const options = {
    value: {
        type: String,
        default: null,
    },
    label: {
        type: String,
        trim: true,
    },
    key: {
        type: String,
        default: null,
    },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
const Setting = (0, mongoose_1.model)("setting", schema, "settings");
exports.Setting = Setting;
