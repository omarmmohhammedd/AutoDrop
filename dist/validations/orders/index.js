"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCustomerDetails = exports.UpdateAddress = exports.ChangeOrderStatus = void 0;
const express_validator_1 = require("express-validator");
const order_model_1 = require("../../models/order.model");
const user_model_1 = require("../../models/user.model");
// "merchant", "status", "orderId", "itemId";
exports.ChangeOrderStatus = [
    (0, express_validator_1.body)("merchant")
        .exists()
        .withMessage("merchant is required")
        .custom(async (val) => {
        const merchant = await user_model_1.User.findOne({
            _id: val,
            userType: "vendor",
        }).exec();
        if (!merchant)
            throw new Error("Invalid merchant");
    }),
    (0, express_validator_1.body)("status")
        .exists()
        .withMessage("status is required")
        .isIn(["in_transit", "in_review", "completed", "canceled"])
        .withMessage("Invalid status"),
    (0, express_validator_1.body)("orderId")
        .exists()
        .withMessage("orderId is required")
        .custom(async (val, { req }) => {
        const merchant = req.body?.merchant;
        const order = await order_model_1.Order.findOne({
            _id: val,
            merchant,
        }).exec();
        if (!order)
            throw new Error("Invalid order");
    }),
];
exports.UpdateAddress = [
    (0, express_validator_1.body)("address")
        .exists()
        .withMessage("address is required")
        .notEmpty()
        .withMessage("Invalid address"),
    (0, express_validator_1.body)("postal_code")
        .exists()
        .withMessage("postal code is required")
        .notEmpty()
        .withMessage("Invalid postal code"),
    (0, express_validator_1.body)("source")
        .exists()
        .withMessage("source is required")
        .notEmpty()
        .withMessage("Invalid source"),
    (0, express_validator_1.body)("id")
        .exists()
        .withMessage("id is required")
        .custom(async (val, { req }) => {
        const order = await order_model_1.Order.findById(val).exec();
        if (!order)
            throw new Error("Invalid order");
    }),
];
exports.UpdateCustomerDetails = [
    (0, express_validator_1.body)("mobile")
        .exists()
        .withMessage("mobile is required")
        .notEmpty()
        .withMessage("Invalid mobile"),
    (0, express_validator_1.body)("mobile_code")
        .exists()
        .withMessage("mobile_code is required")
        .notEmpty()
        .withMessage("Invalid mobile_code"),
    (0, express_validator_1.body)("first_name")
        .exists()
        .withMessage("first name is required")
        .notEmpty()
        .withMessage("Invalid first name"),
    (0, express_validator_1.body)("last_name")
        .exists()
        .withMessage("last name is required")
        .notEmpty()
        .withMessage("Invalid last name"),
    (0, express_validator_1.body)("id")
        .exists()
        .withMessage("id is required")
        .custom(async (val, { req }) => {
        const order = await order_model_1.Order.findById(val).exec();
        if (!order)
            throw new Error("Invalid order");
    }),
];
