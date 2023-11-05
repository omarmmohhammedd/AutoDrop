import { Router } from "express";
import Authentication from "../../middlewares/authentication";
import * as OrderControllers from "../../controllers/orders";
import { CheckValidationSchema } from "../../middlewares/CheckValidationSchema";
import { ChangeOrderStatus, updateCustomerDetails } from "../../validations/orders";

const orderRouter: Router = Router();

orderRouter.get("/all", Authentication(), OrderControllers.GetAllOrders);
orderRouter.get("/:id", Authentication(), OrderControllers.GetSelectedOrder);
orderRouter.post("/delete", Authentication(), OrderControllers.DeleteOrder);
// orderRouter.post("/place-order", Authentication(), (req, res, next) => {
//   OrderControllers.CreateAliExpressOrder(req.body);
// });
orderRouter.post(
  "/pay-order",
  Authentication(),
  OrderControllers.CreatePaymentToSubscribe
);
orderRouter.post(
  "/update-status",
  Authentication(),
  ChangeOrderStatus,
  CheckValidationSchema,
  OrderControllers.UpdateOrderStatus
);

orderRouter.post('/update-customer-details',updateCustomerDetails,OrderControllers.UpdateCustomeDetails)
orderRouter.post('/update-address',OrderControllers.UpdateCustomerAddress)
orderRouter.post('/update-shipping',OrderControllers.updateShipping)

export default orderRouter;
