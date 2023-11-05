import { Product } from "../models/product.model";
import { ValidationChain, body } from "express-validator";
import { pick } from "lodash";
import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model";

const GetDetails = [
  body("url")
    .exists()
    .withMessage("URL is required")
    .isURL()
    .withMessage("Invalid url"),
] satisfies ValidationChain[];

const DeleteProduct = [
  body("id")
    .exists()
    .withMessage("product is required")
    .isMongoId()
    .withMessage("Invalid id")
    .custom(async (value: string) => {
      if (!value) return;
      if (!isValidObjectId(value)) return;
      const product = await Product.findById(value).exec();
      if (!product) throw new Error("Product not found");
      return false;
    }),
] satisfies ValidationChain[];

const CreateProduct = [
  body("name").exists().withMessage("name required"),
  body("price").exists().withMessage("price required"),
  body("quantity")
    .exists()
    .withMessage("quantity required")
    .isNumeric()
    .withMessage("Should be type of number")
    .isLength({ min: 1 })
    .withMessage("Min quantity should be 1"),
  body("sku").exists().withMessage("sku required"),
  body("merchant").custom(async (val: any, { req }: any) => {
    const { userType } = pick(req.local, ["userType"]);


    if (userType === "admin") {
      if (!val) throw new Error("merchant is required");
      if (!isValidObjectId(val)) throw new Error("Invalid id");
      const vendor = await User.findById(val).exec();
      if (!vendor) throw new Error("Invalid vendor");
    }

    return true;
  }),
] satisfies ValidationChain[];

export { GetDetails, DeleteProduct, CreateProduct };
