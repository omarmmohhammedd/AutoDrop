import { Router } from "express";
import Authentication from "../../middlewares/authentication";
import * as TransactionController from "../../controllers/transactions";

const transactionRouter = Router();

transactionRouter.get(
  "/",
  Authentication(),
  TransactionController.GetTransactions
);

export default transactionRouter;
