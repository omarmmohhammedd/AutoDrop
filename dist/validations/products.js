"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShippings = exports.PlaceOrderProductsShippingServices = exports.GetDetails = exports.DeleteProduct = exports.CreateProduct = void 0;
const express_validator_1 = require("express-validator");
const order_model_1 = require("../models/order.model");
const GetDetails = [
    (0, express_validator_1.body)("url")
        .exists()
        .withMessage("URL is required")
        .isURL()
        .withMessage("Invalid url"),
];
exports.GetDetails = GetDetails;
const PlaceOrderProductsShippingServices = [
    (0, express_validator_1.body)("id")
        .exists()
        .withMessage("Order is required")
        .isMongoId()
        .withMessage("Invalid id")
        .custom(async (value) => {
        const isExisted = await order_model_1.Order.findById(value).exec();
        if (!isExisted)
            throw Error("Order is invalid");
    }),
    (0, express_validator_1.body)("shipping.*.product_id").exists().withMessage("Product is required"),
    (0, express_validator_1.body)("shipping.*.service_name")
        .exists()
        .withMessage("Shipping method is required"),
    (0, express_validator_1.body)("shipping.*.amount").exists().withMessage("amount is required"),
];
exports.PlaceOrderProductsShippingServices = PlaceOrderProductsShippingServices;
const DeleteProduct = [
    (0, express_validator_1.body)("id")
        .exists()
        .withMessage("product is required")
        .isMongoId()
        .withMessage("Invalid id"),
];
exports.DeleteProduct = DeleteProduct;
const CreateProduct = [
    (0, express_validator_1.body)("name").exists().withMessage("name required"),
    (0, express_validator_1.body)("options")
        .exists()
        .withMessage("options required")
        .isArray()
        .withMessage("options should be typeof array"),
    (0, express_validator_1.body)("options.*.name").exists().withMessage("name required"),
    (0, express_validator_1.body)("options.*.values")
        .exists()
        .withMessage("values required")
        .isArray()
        .withMessage("values should be typeof array"),
    (0, express_validator_1.body)("metadata_title")
        .optional()
        .isLength({
        max: 70,
    })
        .withMessage("Max length is 70 letter"),
    (0, express_validator_1.body)("options.*.values.*.name").exists().withMessage("name required"),
    (0, express_validator_1.body)("options.*.values.*.price").exists().withMessage("price required"),
    (0, express_validator_1.body)("options.*.values.*.quantity").exists().withMessage("quantity required"),
    (0, express_validator_1.body)("options.*.values.*.sku").exists().withMessage("sku required"),
    (0, express_validator_1.body)("options.*.values.*.sku_id").exists().withMessage("sku id required"),
    (0, express_validator_1.body)("options.*.values.*.property_id")
        .exists()
        .withMessage("property id required"),
    (0, express_validator_1.body)("vendor_commission").exists().withMessage("price required"),
    // body("quantity")
    //   .exists()
    //   .withMessage("quantity required")
    //   .isNumeric()
    //   .withMessage("Should be type of number")
    //   .isLength({ min: 1 })
    //   .withMessage("Min quantity should be 1"),
    // body("sku").exists().withMessage("sku required"),
];
exports.CreateProduct = CreateProduct;
const getShippings = [
    (0, express_validator_1.body)("product_id")
        .exists()
        .withMessage("is required")
        .notEmpty()
        .withMessage("Empty value is not acceptable"),
    (0, express_validator_1.body)("product_num")
        .exists()
        .withMessage("is required")
        .notEmpty()
        .withMessage("Empty value is not acceptable"),
    (0, express_validator_1.body)("sku_id")
        .exists()
        .withMessage("is required")
        .notEmpty()
        .withMessage("Empty value is not acceptable"),
];
exports.getShippings = getShippings;
