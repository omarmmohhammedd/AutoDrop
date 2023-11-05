"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.mongoPaginate = void 0;
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
exports.mongoPaginate = mongoose_paginate_v2_1.default;
const options = {
    prevPage: "Prev",
    nextPage: "Next",
    limit: 25,
    sort: "-createdAt",
    customLabels: {
        totalDocs: "total",
        docs: "data",
        limit: "perPage",
        page: "current_page",
        nextPage: "next",
        prevPage: "prev",
        meta: "pagination",
    },
};
exports.options = options;
mongoose_paginate_v2_1.default.paginate.options = options;
