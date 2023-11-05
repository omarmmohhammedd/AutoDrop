import { Router } from "express";
import * as productControllers from "../../controllers/products";
import Authentication from "../../middlewares/authentication";
import {
  CreateProduct,
  DeleteProduct,
  GetDetails,

} from "../../validations/products";
import { CheckValidationSchema } from "../../middlewares/CheckValidationSchema";

const productsRouter: Router = Router();

productsRouter.post(
  "/get-details",
  [...GetDetails, CheckValidationSchema],
  productControllers.GetProductDetails
);

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

productsRouter.get('/converter/currncey',productControllers.currencyConverterr)
productsRouter.get("/all", Authentication(), productControllers.GetAllProducts);
productsRouter.get(
  "/:id",
  Authentication(),
  productControllers.GetSelectedProduct
);

productsRouter.post('/shipping/:id',productControllers.getProductShippingDetails)


export default productsRouter;
