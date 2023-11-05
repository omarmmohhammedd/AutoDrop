"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = require("node-cron");
const user_model_1 = require("../../models/user.model");
const moment_1 = __importDefault(require("moment"));
const subscription_model_1 = require("../../models/subscription.model");
const order_model_1 = require("../../models/order.model");
const product_model_1 = require("../../models/product.model");
const transaction_model_1 = require("../../models/transaction.model");
const time = "* */24 * * *";
// const time: string = "*/1 * * * *";
const deletionTask = (0, node_cron_1.schedule)(time, async function () {
    try {
        console.log("cron job started to delete users, transactions and others");
        const users = await user_model_1.User.find({ deletedAt: { $ne: null } });
        for await (const user of users) {
            const remainingDays = (0, moment_1.default)().diff(new Date(user.deletedAt), "days", true);
            const roundDays = Math.round(remainingDays);
            // check if account should delete after 7days
            if (roundDays >= 7) {
                await Promise.all([
                    subscription_model_1.Subscription.findOneAndDelete({
                        user: user.id,
                    }),
                    order_model_1.Order.deleteMany({
                        merchant: user.id,
                    }),
                    product_model_1.Product.deleteMany({
                        merchant: user.id,
                    }),
                    transaction_model_1.Transaction.deleteMany({
                        user: user.id,
                    }),
                ]);
                console.log("account => ", user.id, " has been deleted successfully");
            }
        }
        //   await Promise.all([
        // 	User.
        //   ])
    }
    catch (error) {
        console.log("Error while deleting..");
        console.log(error);
    }
});
exports.default = deletionTask;
