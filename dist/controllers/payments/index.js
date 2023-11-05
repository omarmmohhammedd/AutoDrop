"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInvoiceDetails = exports.GetChargeDetails = exports.CreateCustomer = exports.CheckOrderPayment = exports.CheckSubscriptionResult = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const lodash_1 = require("lodash");
const moment_1 = __importDefault(require("moment"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const TabPayment_1 = __importDefault(require("../../features/TabPayment"));
const baseApi_1 = __importDefault(require("../../features/baseApi"));
const orders_1 = require("../../features/salla/orders");
const authentication_1 = require("../../middlewares/authentication");
const access_model_1 = require("../../models/access.model");
const order_model_1 = require("../../models/order.model");
const plan_model_1 = require("../../models/plan.model");
const subscription_model_1 = require("../../models/subscription.model");
const transaction_model_1 = require("../../models/transaction.model");
const user_model_1 = require("../../models/user.model");
const orders_2 = require("../orders");
const features_1 = require("../orders/features");
const TPayment = new TabPayment_1.default();
class PaymentsController extends baseApi_1.default {
    async CheckSubscriptionResult(req, res, next) {
        try {
            const { reference, id, status } = (0, lodash_1.pick)(req.body, [
                "reference",
                "id",
                "status",
            ]);
            const chargeId = reference?.order.replace("ref-", "");
            const [userID, planId] = chargeId?.split("-");
            if (status !== "CAPTURED")
                return res.render("payment-error.ejs");
            const [user, plan] = await Promise.all([
                user_model_1.User.findById(userID).exec(),
                plan_model_1.Plan.findById(planId).exec(),
            ]);
            if (!user)
                throw new ApiError_1.default("NotFound", "Invalid account");
            if (!plan)
                throw new ApiError_1.default("NotFound", "Selected plan is not available");
            const currentDate = (0, moment_1.default)().toDate();
            const nextPayment = (0, moment_1.default)()
                .add(1, plan.is_monthly ? "month" : "year")
                .toDate();
            const subscription = new subscription_model_1.Subscription({
                start_date: currentDate,
                expiry_date: nextPayment,
                plan: plan.id,
                user: user.id,
                orders_limit: plan.orders_limit,
                products_limit: plan.products_limit,
            });
            const transaction = new transaction_model_1.Transaction({
                status: status,
                tranRef: id,
                plan: plan.id,
                amount: plan.price,
                user: user?.id,
            });
            await Promise.all([
                subscription_model_1.Subscription.deleteMany({ user: user.id }),
                transaction.save(),
                subscription.save(),
            ]);
            res.render("payment-success.ejs");
        }
        catch (error) {
            res.render("payment-error.ejs");
            next(error);
        }
    }
    async CheckOrderPayment(
    // POST:  api/v1/payments/callback/pay-order
    req, res, next) {
        try {
            const { reference, id, status, description } = (0, lodash_1.pick)(req.body, [
                "reference",
                "id",
                "status",
                "description",
            ]);
            const chargeId = reference?.order.replace("ref-", "");
            const [userID, orderId] = chargeId?.split("-");
            // const transactionResults = await session.withTransaction(
            //   async () => {
            if (status !== "CAPTURED")
                return res.end();
            const [user, order] = await Promise.all([
                user_model_1.User.findById(userID).exec(),
                order_model_1.Order.findById(orderId).exec(),
            ]);
            if (!user)
                throw new ApiError_1.default("NotFound", "Invalid account");
            if (!order)
                throw new ApiError_1.default("NotFound", "Selected order is not available");
            const amount = await (0, features_1.UnpaidPrices)([order]);
            const totalAmountWithVat = (0, features_1.CollectVATPrice)(amount);
            // total amount with VAT + SHIPPING
            const totalUnpaidAmount = (0, features_1.CollectShippingFee)(totalAmountWithVat);
            console.log("TOTAL UNPAID AMOUNT: ", totalUnpaidAmount);
            const transaction = new transaction_model_1.Transaction({
                status,
                tranRef: id,
                user: user?.id || userID,
                order: order?.id || orderId,
                amount: totalUnpaidAmount,
            });
            const status_track = (0, orders_2.UpdateOrderTracking)("in_review", order);
            order.status = "in_review";
            order.status_track = status_track;
            order.notes = description;
            const token = await access_model_1.Token.findOne({
                userId: user.id,
            }).exec();
            const access_token = (0, authentication_1.CheckTokenExpire)(token);
            await (0, orders_1.UpdateOrderStatus)("in_progress", order.order_id, access_token).catch((err) => {
                console.log(err.response.data);
            });
            // await CreateAliExpressOrder({ ...req.body, id: orderId }); // create new order
            await Promise.all([order.save(), transaction.save()]);
            // res.render("payment-success.ejs");
            res.send("order success");
        }
        catch (error) {
            // res.render("payment-error.ejs");
            next(error);
        }
    }
    async CreateCustomer(req, res, next) {
        try {
            const { id } = (0, lodash_1.pick)(req.body, ["id"]);
            const account = await user_model_1.User.findById(id).exec();
            if (!account)
                throw new ApiError_1.default("NotFound", "Account is invalid");
            TPayment.CreateCustomer({
                first_name: account?.name?.split(/\s/gi)?.[0],
                last_name: account?.name?.split(/\s/gi)?.[1],
                email: account?.email,
                metadata: {
                    account_id: account?.id,
                },
            })
                .then(async ({ data }) => {
                account.pt_customer_id = data.id;
                await account.save();
                super.send(res, "Feature enabled successfully!");
            })
                .catch((err) => {
                return next(new ApiError_1.default("ServiceUnavailable", err?.message));
            });
        }
        catch (error) {
            next(error);
        }
    }
    async GetChargeDetails(
    // GET: api/payments/callback/pay-order
    req, res, next) {
        try {
            const { tap_id } = (0, lodash_1.pick)(req.query, ["tap_id"]);
            if (!tap_id || !/^chg_/gi.test(tap_id))
                return res.render("payment-error.ejs");
            TPayment.GetChargeDetails(tap_id)
                .then(({ data }) => {
                console.log(data);
                if (data.status !== "CAPTURED")
                    return res.render("payment-error.ejs");
                return res.render("payment-success.ejs");
            })
                .catch((error) => {
                return res.render("payment-error.ejs");
            });
        }
        catch (error) {
            res.render("payment-error.ejs");
        }
    }
    async GetInvoiceDetails(req, res, next) {
        try {
            const { tap_id } = (0, lodash_1.pick)(req.query, ["tap_id"]);
            if (!tap_id || !/^inv_/gi.test(tap_id))
                return res.render("payment-error.ejs");
            TPayment.GetInvoiceDetails(tap_id)
                .then(({ data }) => {
                if (data.status !== "PAID")
                    return res.render("payment-error.ejs");
                return res.render("payment-success.ejs");
            })
                .catch((error) => {
                return res.render("payment-error.ejs");
            });
        }
        catch (error) {
            res.render("payment-error.ejs");
        }
    }
}
_a = new PaymentsController(), exports.CheckSubscriptionResult = _a.CheckSubscriptionResult, exports.CheckOrderPayment = _a.CheckOrderPayment, exports.CreateCustomer = _a.CreateCustomer, exports.GetChargeDetails = _a.GetChargeDetails, exports.GetInvoiceDetails = _a.GetInvoiceDetails;
