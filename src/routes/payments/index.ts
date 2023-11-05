import { Router } from "express";
import * as PaymentController from "../../controllers/payments";
import Authentication from "../../middlewares/authentication";

const paymentRouter = Router();
// /v1/payments/
paymentRouter.post(
  "/callback/subscriptions",
  PaymentController.CheckSubscriptionResult
);
paymentRouter.get(
  "/callback/subscriptions",
  PaymentController.GetChargeDetails
);

paymentRouter.post("/callback/pay-order", PaymentController.CheckOrderPayment);
paymentRouter.get("/callback/pay-order", PaymentController.GetChargeDetails);
// paymentRouter.get("/callback/pay-order", PaymentController.GetInvoiceDetails);
paymentRouter.post(
  "/enable",
  Authentication("vendor"),
  PaymentController.CreateCustomer
);

export default paymentRouter;
