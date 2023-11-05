"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const products_1 = __importDefault(require("./products"));
const orders_1 = __importDefault(require("./orders"));
const root_1 = __importDefault(require("./root"));
const plans_1 = __importDefault(require("./plans"));
const payments_1 = __importDefault(require("./payments"));
const transactions_1 = __importDefault(require("./transactions"));
const orders_2 = require("../features/salla/orders");
const authentication_1 = __importDefault(require("../middlewares/authentication"));
const aliepress_1 = __importDefault(require("./aliepress"));
const router = (0, express_1.Router)();
router.use("/auth", auth_1.default);
router.use("/orders", orders_1.default);
router.use("/plans", plans_1.default);
router.use("/transactions", transactions_1.default);
router.use("/products/v1", products_1.default);
router.use("/v1/payments", payments_1.default);
router.use("/", root_1.default);
router.use('/salla/cities', (0, authentication_1.default)(), orders_2.getCities);
router.use('/aliexpress', aliepress_1.default);
exports.default = router;