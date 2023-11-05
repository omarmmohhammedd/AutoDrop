"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTransactions = void 0;
const lodash_1 = require("lodash");
const transaction_model_1 = require("../../models/transaction.model");
async function GetTransactions(req, res, next) {
    try {
        const { user_id } = (0, lodash_1.pick)(req.local, ["user_id"]);
        const transactions = await transaction_model_1.Transaction.paginate({ user: user_id }, {
            populate: [{ path: "plan" }, { path: "order" }],
        });
        res.json(transactions);
    }
    catch (error) {
        next(error);
    }
}
exports.GetTransactions = GetTransactions;
