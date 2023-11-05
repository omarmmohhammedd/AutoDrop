import { Request, Response, NextFunction } from "express";
import { pick } from "lodash";
import {
  Transaction,
  TransactionDocument,
} from "../../models/transaction.model";

export async function GetTransactions(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { user_id } = pick(req.local, ["user_id"]);
    const transactions = await Transaction.paginate(
      { user: user_id },
      {
        populate: [{ path: "plan" }, { path: "order" }],
      }
    );

    res.json(transactions);
  } catch (error) {
    next(error);
  }
}
