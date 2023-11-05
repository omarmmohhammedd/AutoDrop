"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtensions = void 0;
const lodash_1 = require("lodash");
const ModelsFactor_1 = __importDefault(require("../../features/ModelsFactor"));
const baseApi_1 = __importDefault(require("../../features/baseApi"));
const extension_model_1 = require("../../models/extension.model");
class ExtensionController extends baseApi_1.default {
    async getExtensions(req, res, next) {
        try {
            const { page = 1, search_key } = (0, lodash_1.pick)(req.query, ["page", "search_key"]);
            const extensions = await (0, ModelsFactor_1.default)(extension_model_1.Extension, {
                page,
                search_key,
                select: "name type id details createdAt updatedAt logo appId",
            }, {});
            super.send(res, { extensions });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.getExtensions = new ExtensionController().getExtensions;
