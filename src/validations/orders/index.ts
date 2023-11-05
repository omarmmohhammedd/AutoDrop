import { body, check, ValidationChain } from "express-validator";
import { User } from "../../models/user.model";
import { Order } from "../../models/order.model";
import { Request } from "express";
import { CheckValidationSchema } from "../../middlewares/CheckValidationSchema";

// "merchant", "status", "orderId", "itemId";

export const ChangeOrderStatus = [
  body("merchant")
    .exists()
    .withMessage("merchant is requited")
    .custom(async (val) => {
      const merchant = await User.findOne({
        _id: val,
        userType: "vendor",
      }).exec();

      if (!merchant) throw new Error("Invalid merchant");
    }),
  body("status")
    .exists()
    .withMessage("status is requited")
    .isIn(["in_transit", "in_review", "completed", "canceled"])
    .withMessage("Invalid status"),
  body("orderId")
    .exists()
    .withMessage("orderId is requited")
    .custom(async (val, { req }: any) => {
      const merchant = req.body?.merchant;
      const order = await Order.findOne({
        _id: val,
        merchant,
      }).exec();

      if (!order) throw new Error("Invalid order");
    }),
    CheckValidationSchema
] 


export const updateCustomerDetails = [
  check("id")
    .isMongoId()
    .withMessage("Add Valid Order Id"),
    check("first_name").notEmpty().isLength({min:3}).withMessage("Add Valid First Name With Min Characters 3"),
    check("middle_name").notEmpty().isLength({min:3}).withMessage("Add Valid Middle Name With Min Characters 3"),
    check("last_name").notEmpty().isLength({min:3}).withMessage("Add Valid Last Name With Min Characters 3"),
    check("mobile").notEmpty().isLength({min:9}).withMessage("Add Valid Mobile With Min Numbers 9").custom((mobile:number)=>{
      console.log(mobile.toString())
    if(Number(mobile.toString().split('')[0]) !==5 ) {
      throw new Error('Invalid Mobile Must Start With 5')
    }
    return true
  }),
  CheckValidationSchema
] ;

