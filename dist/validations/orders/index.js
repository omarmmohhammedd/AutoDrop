"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerDetails = exports.ChangeOrderStatus = void 0;
const express_validator_1 = require("express-validator");
const user_model_1 = require("../../models/user.model");
const order_model_1 = require("../../models/order.model");
const CheckValidationSchema_1 = require("../../middlewares/CheckValidationSchema");
// "merchant", "status", "orderId", "itemId";
exports.ChangeOrderStatus = [
    (0, express_validator_1.body)("merchant")
        .exists()
        .withMessage("merchant is requited")
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
        .withMessage("status is requited")
        .isIn(["in_transit", "in_review", "completed", "canceled"])
        .withMessage("Invalid status"),
    (0, express_validator_1.body)("orderId")
        .exists()
        .withMessage("orderId is requited")
        .custom(async (val, { req }) => {
        const merchant = req.body?.merchant;
        const order = await order_model_1.Order.findOne({
            _id: val,
            merchant,
        }).exec();
        if (!order)
            throw new Error("Invalid order");
    }),
    CheckValidationSchema_1.CheckValidationSchema
];
exports.updateCustomerDetails = [
    (0, express_validator_1.check)("id")
        .isMongoId()
        .withMessage("Add Valid Order Id"),
    (0, express_validator_1.check)("first_name").notEmpty().isLength({ min: 3 }).withMessage("Add Valid First Name With Min Characters 3"),
    (0, express_validator_1.check)("middle_name").notEmpty().isLength({ min: 3 }).withMessage("Add Valid Middle Name With Min Characters 3"),
    (0, express_validator_1.check)("last_name").notEmpty().isLength({ min: 3 }).withMessage("Add Valid Last Name With Min Characters 3"),
    (0, express_validator_1.check)("mobile").notEmpty().isLength({ min: 9 }).withMessage("Add Valid Mobile With Min Numbers 9").custom((mobile) => {
        console.log(mobile.toString());
        if (Number(mobile.toString().split('')[0]) !== 5) {
            throw new Error('Invalid Mobile Must Start With 5');
        }
        return true;
    }),
    CheckValidationSchema_1.CheckValidationSchema
];
