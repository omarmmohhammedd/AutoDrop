"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTransactions = void 0;
const lodash_1 = require("lodash");
const baseApi_1 = __importDefault(require("../../features/baseApi"));
const transaction_model_1 = require("../../models/transaction.model");
class TransactionsController extends baseApi_1.default {
    async GetTransactions(req, res, next) {
        try {
            const { user_id } = (0, lodash_1.pick)(req.local, ["user_id"]);
            const transactions = await transaction_model_1.Transaction.paginate({ user: user_id }, {
                populate: [{ path: "plan" }, { path: "order" }],
            });
            super.send(res, { transactions });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GetTransactions = new TransactionsController().GetTransactions;
