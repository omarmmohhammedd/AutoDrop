"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aliexpress_1 = require("../../controllers/aliexpress");
const orders_1 = require("../../controllers/aliexpress/orders");
const products_1 = require("../../controllers/aliexpress/products");
const CheckValidationSchema_1 = require("../../middlewares/CheckValidationSchema");
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const aliexpress_2 = require("../../validations/aliexpress");
const products_2 = require("../../validations/products");
const router = (0, express_1.Router)();
router.post("/init", (0, authentication_1.default)("admin"), [...aliexpress_2.CheckAccessTokenData, CheckValidationSchema_1.CheckValidationSchema], aliexpress_1.initializeApp);
router.post("/products/get", (0, authentication_1.default)("vendor"), [...products_2.GetDetails, CheckValidationSchema_1.CheckValidationSchema], products_1.GetProductDetails);
router.post("/products/shipping", (0, authentication_1.default)("vendor"), [...products_2.getShippings, CheckValidationSchema_1.CheckValidationSchema], products_1.GetProductShipping);
router.post("/orders/place-order", (0, authentication_1.default)(), orders_1.placeOrder);
exports.default = router;
