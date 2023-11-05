"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProduct = exports.DeleteProduct = exports.GetDetails = void 0;
const product_model_1 = require("../models/product.model");
const express_validator_1 = require("express-validator");
const lodash_1 = require("lodash");
const mongoose_1 = require("mongoose");
const user_model_1 = require("../models/user.model");
const GetDetails = [
    (0, express_validator_1.body)("url")
        .exists()
        .withMessage("URL is required")
        .isURL()
        .withMessage("Invalid url"),
];
exports.GetDetails = GetDetails;
const DeleteProduct = [
    (0, express_validator_1.body)("id")
        .exists()
        .withMessage("product is required")
        .isMongoId()
        .withMessage("Invalid id")
        .custom(async (value) => {
        if (!value)
            return;
        if (!(0, mongoose_1.isValidObjectId)(value))
            return;
        const product = await product_model_1.Product.findById(value).exec();
        if (!product)
            throw new Error("Product not found");
        return false;
    }),
];
exports.DeleteProduct = DeleteProduct;
const CreateProduct = [
    (0, express_validator_1.body)("name").exists().withMessage("name required"),
    (0, express_validator_1.body)("price").exists().withMessage("price required"),
    (0, express_validator_1.body)("quantity")
        .exists()
        .withMessage("quantity required")
        .isNumeric()
        .withMessage("Should be type of number")
        .isLength({ min: 1 })
        .withMessage("Min quantity should be 1"),
    (0, express_validator_1.body)("sku").exists().withMessage("sku required"),
    (0, express_validator_1.body)("merchant").custom(async (val, { req }) => {
        const { userType } = (0, lodash_1.pick)(req.local, ["userType"]);
        if (userType === "admin") {
            if (!val)
                throw new Error("merchant is required");
            if (!(0, mongoose_1.isValidObjectId)(val))
                throw new Error("Invalid id");
            const vendor = await user_model_1.User.findById(val).exec();
            if (!vendor)
                throw new Error("Invalid vendor");
        }
        return true;
    }),
];
exports.CreateProduct = CreateProduct;
