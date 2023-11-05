import { Router } from "express";
import * as productControllers from "../../../controllers/products/salla";
import { CheckValidationSchema } from "../../../middlewares/CheckValidationSchema";
import Authentication from "../../../middlewares/authentication";
import { CreateProduct, DeleteProduct } from "../../../validations/products";
import { getCities } from "../../../features/salla/orders";

const productsRouter: Router = Router();

productsRouter.post(
  "/delete",
  [Authentication(), ...DeleteProduct, CheckValidationSchema],
  productControllers.DeleteProduct
);

productsRouter.post(
  "/create",
  [Authentication(), ...CreateProduct, CheckValidationSchema],
  productControllers.CreateProduct
);

productsRouter.get("/all", Authentication(), productControllers.GetAllProducts);
productsRouter.get(
  "/:id",
  Authentication(),
  productControllers.GetSelectedProduct
);

productsRouter.get('/salla/cities',getCities)

export default productsRouter;
