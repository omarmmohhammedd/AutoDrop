"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePlan = exports.CreatePlan = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = require("mongoose");
const plan_model_1 = require("../../models/plan.model");
const isDefault = (0, express_validator_1.check)("is_default").custom((val) => !val);
exports.CreatePlan = [
    (0, express_validator_1.body)("name").exists().withMessage("Name is required"),
    (0, express_validator_1.body)("is_monthly")
        .exists()
        .withMessage("Type is required")
        .isBoolean()
        .withMessage("Type is invalid value"),
    (0, express_validator_1.body)("is_default").isBoolean().withMessage("Default plan is invalid value"),
    (0, express_validator_1.body)("price")
        .if(isDefault)
        .exists()
        .withMessage("Price is required")
        .isNumeric()
        .withMessage("Invalid value"),
    (0, express_validator_1.body)("discount_type")
        .if(isDefault)
        .exists()
        .withMessage("Discount type is required")
        .isIn(["fixed", "percentage"])
        .withMessage("Invalid value"),
    (0, express_validator_1.body)("discount_value")
        .if(isDefault)
        .exists()
        .withMessage("Discount value is required")
        .isNumeric()
        .withMessage("Invalid value"),
    (0, express_validator_1.body)("orders_limit")
        .exists()
        .withMessage("Orders limit is required")
        .isNumeric()
        .withMessage("Invalid value"),
    (0, express_validator_1.body)("products_limit")
        .exists()
        .withMessage("Products limit is required")
        .isNumeric()
        .withMessage("Invalid value"),
];
exports.UpdatePlan = [
    (0, express_validator_1.body)("id")
        .exists()
        .withMessage("ID is required")
        .isMongoId()
        .withMessage("Invalid id type")
        .custom(async (val) => {
        if (!val)
            return;
        if (!(0, mongoose_1.isValidObjectId)(val))
            return;
        const plan = await plan_model_1.Plan.findById(val).exec();
        if (!plan)
            throw new Error("Selected plan is invalid");
    }),
    (0, express_validator_1.body)("name").exists().withMessage("Name is required"),
    (0, express_validator_1.body)("is_monthly")
        .exists()
        .withMessage("Type is required")
        .isBoolean()
        .withMessage("Type is invalid value"),
    (0, express_validator_1.body)("is_default").isBoolean().withMessage("Default plan is invalid value"),
    (0, express_validator_1.body)("price")
        .if(isDefault)
        .exists()
        .withMessage("Price is required")
        .isNumeric()
        .withMessage("Invalid value"),
    (0, express_validator_1.body)("discount_type")
        .if(isDefault)
        .exists()
        .withMessage("Discount type is required")
        .isIn(["fixed", "percentage"])
        .withMessage("Invalid value"),
    (0, express_validator_1.body)("discount_value")
        .if(isDefault)
        .exists()
        .withMessage("Discount value is required")
        .isNumeric()
        .withMessage("Invalid value"),
    (0, express_validator_1.body)("orders_limit")
        .exists()
        .withMessage("Orders limit is required")
        .isNumeric()
        .withMessage("Invalid value"),
    (0, express_validator_1.body)("products_limit")
        .exists()
        .withMessage("Products limit is required")
        .isNumeric()
        .withMessage("Invalid value"),
];
