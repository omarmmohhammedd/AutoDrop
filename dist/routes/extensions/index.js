"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const extensions_1 = require("../../controllers/extensions");
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const extensionsRouter = (0, express_1.Router)();
extensionsRouter.get("/all", (0, authentication_1.default)(), extensions_1.getExtensions);
exports.default = extensionsRouter;
