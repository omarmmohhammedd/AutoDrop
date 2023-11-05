import { Router } from "express";
import { initializeApp } from "../../controllers/aliexpress";
import { placeOrder } from "../../controllers/aliexpress/orders";
import {
  GetProductDetails,
  GetProductShipping,
} from "../../controllers/aliexpress/products";
import { CheckValidationSchema } from "../../middlewares/CheckValidationSchema";
import Authentication from "../../middlewares/authentication";
import { CheckAccessTokenData } from "../../validations/aliexpress";
import { GetDetails } from "../../validations/products";
const router = Router();

router.post(
  "/init",
  Authentication("admin"),
  [...CheckAccessTokenData, CheckValidationSchema],
  initializeApp
);

router.post(
  "/products/get",
  Authentication("vendor"),
  [...GetDetails, CheckValidationSchema],
  GetProductDetails
);

router.post(
  "/products/shipping",
  Authentication("vendor"),
  GetProductShipping
);

router.post("/orders/place-order", Authentication(), placeOrder);

export default router;
