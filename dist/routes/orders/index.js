"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OrderControllers = __importStar(require("../../controllers/orders"));
const CheckValidationSchema_1 = require("../../middlewares/CheckValidationSchema");
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const orders_1 = require("../../validations/orders");
const products_1 = require("../../validations/products");
const orderRouter = (0, express_1.Router)();
orderRouter.get("/all", (0, authentication_1.default)(), OrderControllers.GetAllOrders);
orderRouter.get("/:id", (0, authentication_1.default)(), OrderControllers.GetSelectedOrder);
orderRouter.post("/delete", (0, authentication_1.default)(), OrderControllers.DeleteOrder);
orderRouter.post("/pay-order", (0, authentication_1.default)(), OrderControllers.CreatePaymentToSubscribe);
orderRouter.post("/update-status", (0, authentication_1.default)(), orders_1.ChangeOrderStatus, CheckValidationSchema_1.CheckValidationSchema, OrderControllers.UpdateOrderStatus);
orderRouter.post("/update-shipping", (0, authentication_1.default)("vendor"), products_1.PlaceOrderProductsShippingServices, CheckValidationSchema_1.CheckValidationSchema, OrderControllers.UpdateProductsShipping);
orderRouter.post("/update-address", (0, authentication_1.default)("vendor"), orders_1.UpdateAddress, CheckValidationSchema_1.CheckValidationSchema, OrderControllers.UpdateCustomerAddress);
orderRouter.post("/update-customer-details", (0, authentication_1.default)("vendor"), orders_1.UpdateCustomerDetails, CheckValidationSchema_1.CheckValidationSchema, OrderControllers.UpdateCustomerDetails);
exports.default = orderRouter;
