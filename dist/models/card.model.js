"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const mongoose_1 = require("mongoose");
const options = {
    card_id: {
        type: String,
        default: null,
    },
    token_id: {
        type: String,
        default: null,
    },
    customer_id: {
        type: String,
        default: null,
    },
    card_placeholder: {
        type: String,
        default: null,
    },
    card_exp: {
        type: String,
        default: null,
    },
    is_default: {
        type: Boolean,
        default: false,
    },
    user: {
        type: mongoose_1.Types.ObjectId,
        default: null,
        ref: "User",
    },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
const Card = (0, mongoose_1.model)("Card", schema, "Cards");
exports.Card = Card;
