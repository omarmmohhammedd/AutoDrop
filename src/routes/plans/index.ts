import { Router } from "express";
import * as PLanController from "../../controllers/plans";
import Authentication from "../../middlewares/authentication";
import { CreatePlan, UpdatePlan } from "../../validations/plans";
import { CheckValidationSchema } from "../../middlewares/CheckValidationSchema";

const plansRouter = Router();

plansRouter.post(
  "/add",
  Authentication("admin"),
  [...CreatePlan, CheckValidationSchema],
  PLanController.CreatePlan
);
plansRouter.post(
  "/update",
  Authentication("admin"),
  [...UpdatePlan, CheckValidationSchema],
  PLanController.UpdatePlan
);
plansRouter.post(
  "/subscribe",

  Authentication(),
  PLanController.CreatePaymentToSubscribe
);
plansRouter.post(
  "/resubscribe",
  Authentication(),
  PLanController.CreatePaymentToSubscribe
);

plansRouter.post(
  "/delete/:id",
  Authentication("admin"),
  PLanController.DeletePlan
);

plansRouter.post(
  "/transactions/:user",
  Authentication("admin"),
  PLanController.GetPlanAndVendorTransactions
);

plansRouter.get(
  "/subscriptions",
  Authentication("admin"),
  PLanController.GetAllSubscriptions
);
plansRouter.get("/", PLanController.GetAllPlans);
plansRouter.get(
  "/:id",
  Authentication("admin"),
  PLanController.GetSelectedPlan
);

export default plansRouter;
