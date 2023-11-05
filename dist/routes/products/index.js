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
const productControllers = __importStar(require("../../controllers/products"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const products_1 = require("../../validations/products");
const CheckValidationSchema_1 = require("../../middlewares/CheckValidationSchema");
const productsRouter = (0, express_1.Router)();
productsRouter.post("/get-details", [...products_1.GetDetails, CheckValidationSchema_1.CheckValidationSchema], productControllers.GetProductDetails);
productsRouter.post("/delete", [(0, authentication_1.default)(), ...products_1.DeleteProduct, CheckValidationSchema_1.CheckValidationSchema], productControllers.DeleteProduct);
productsRouter.post("/create", [(0, authentication_1.default)(), ...products_1.CreateProduct, CheckValidationSchema_1.CheckValidationSchema], productControllers.CreateProduct);
productsRouter.get('/converter/currncey', productControllers.currencyConverterr);
productsRouter.get("/all", (0, authentication_1.default)(), productControllers.GetAllProducts);
productsRouter.get("/:id", (0, authentication_1.default)(), productControllers.GetSelectedProduct);
productsRouter.post('/shipping/:id', productControllers.getProductShippingDetails);
exports.default = productsRouter;
