import { ValidationChain, body, check } from "express-validator";
import { isValidObjectId } from "mongoose";
import { Plan } from "../../models/plan.model";

const isDefault = check("is_default").custom((val) => !val);

export const CreatePlan = [
  body("name").exists().withMessage("Name is required"),
  body("is_monthly")
    .exists()
    .withMessage("Type is required")
    .isBoolean()
    .withMessage("Type is invalid value"),
  body("is_default").isBoolean().withMessage("Default plan is invalid value"),
  body("price")
    .if(isDefault)
    .exists()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Invalid value"),
  body("discount_type")
    .if(isDefault)
    .exists()
    .withMessage("Discount type is required")
    .isIn(["fixed", "percentage"])
    .withMessage("Invalid value"),
  body("discount_value")
    .if(isDefault)
    .exists()
    .withMessage("Discount value is required")
    .isNumeric()
    .withMessage("Invalid value"),
  body("orders_limit")
    .exists()
    .withMessage("Orders limit is required")
    .isNumeric()
    .withMessage("Invalid value"),
  body("products_limit")
    .exists()
    .withMessage("Products limit is required")
    .isNumeric()
    .withMessage("Invalid value"),
] satisfies ValidationChain[];

export const UpdatePlan = [
  body("id")
    .exists()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("Invalid id type")
    .custom(async (val) => {
      if (!val) return;
      if (!isValidObjectId(val)) return;
      const plan = await Plan.findById(val).exec();
      if (!plan) throw new Error("Selected plan is invalid");
    }),
  body("name").exists().withMessage("Name is required"),
  body("is_monthly")
    .exists()
    .withMessage("Type is required")
    .isBoolean()
    .withMessage("Type is invalid value"),
  body("is_default").isBoolean().withMessage("Default plan is invalid value"),
  body("price")
    .if(isDefault)
    .exists()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Invalid value"),
  body("discount_type")
    .if(isDefault)
    .exists()
    .withMessage("Discount type is required")
    .isIn(["fixed", "percentage"])
    .withMessage("Invalid value"),
  body("discount_value")
    .if(isDefault)
    .exists()
    .withMessage("Discount value is required")
    .isNumeric()
    .withMessage("Invalid value"),
  body("orders_limit")
    .exists()
    .withMessage("Orders limit is required")
    .isNumeric()
    .withMessage("Invalid value"),
  body("products_limit")
    .exists()
    .withMessage("Products limit is required")
    .isNumeric()
    .withMessage("Invalid value"),
] satisfies ValidationChain[];
