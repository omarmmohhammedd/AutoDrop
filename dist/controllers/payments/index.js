"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInvoiceDetails = exports.GetChargeDetails = exports.CreateCustomer = exports.CheckOrderPayment = exports.CheckSubscriptionResult = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const lodash_1 = require("lodash");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const user_model_1 = require("../../models/user.model");
const plan_model_1 = require("../../models/plan.model");
const moment_1 = __importDefault(require("moment"));
const transaction_model_1 = require("../../models/transaction.model");
const subscription_model_1 = require("../../models/subscription.model");
const order_model_1 = require("../../models/order.model");
const features_1 = require("../orders/features");
const TabPayment_1 = __importDefault(require("../../features/TabPayment"));
const orders_1 = require("../orders");
const PlaceOrder_1 = require("../../features/aliExpress/features/PlaceOrder");
const TPayment = new TabPayment_1.default();
async function CheckSubscriptionResult(req, res, next) {
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
        console.log(subscription);
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
        console.log("error while updating user => \n", error);
        res.render("payment-error.ejs");
        next(error);
    }
}
exports.CheckSubscriptionResult = CheckSubscriptionResult;
async function CheckOrderPayment(
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
        const orderData = order.toJSON();
        const amount = await (0, features_1.UnpaidPrices)([order]);
        const totalAmountWithVat = (0, features_1.CollectVATPrice)(amount);
        // total amount with VAT + SHIPPING
        const totalUnpaidAmount = totalAmountWithVat + orderData.shippingFee;
        console.log("TOTAL UNPAID AMOUNT: ", totalUnpaidAmount);
        const transaction = new transaction_model_1.Transaction({
            status,
            tranRef: id,
            user: user?.id || userID,
            order: order?.id || orderId,
            amount: totalUnpaidAmount,
        });
        const status_track = (0, orders_1.UpdateOrderTracking)("in_review", order);
        order.status = "in_review";
        order.status_track = status_track;
        order.notes = description;
        // const tokens = user?.tokens;
        // const access_token = CheckTokenExpire(tokens);
        // await UpdateSalaOrderStatus("in_progress", order.order_id, access_token).catch(
        //   (err) => {
        //     console.log(err.response.data);
        //   }
        // );
        // await CreateAliExpressOrder({ ...req.body, id: orderId }); // create new order
        await Promise.all([order.save(), transaction.save()]);
        // res.render("payment-success.ejs");
        res.end();
    }
    catch (error) {
        console.log("error while updating order => \n", error);
        // res.render("payment-error.ejs");
        next(error);
    }
}
exports.CheckOrderPayment = CheckOrderPayment;
async function CreateCustomer(req, res, next) {
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
            res.json({ message: "Feature enabled successfully!" });
        })
            .catch((err) => {
            console.log(err);
            return next(new ApiError_1.default("ServiceUnavailable", err?.message));
        });
    }
    catch (error) {
        next(error);
    }
}
exports.CreateCustomer = CreateCustomer;
async function GetChargeDetails(
// GET: api/payments/callback/pay-order
req, res, next) {
    try {
        const { tap_id } = (0, lodash_1.pick)(req.query, ["tap_id"]);
        if (!tap_id || !/^chg_/gi.test(tap_id))
            return res.render("payment-error.ejs");
        TPayment.GetChargeDetails(tap_id)
            .then(async ({ data }) => {
            if (data.status !== "CAPTURED")
                return res.render("payment-error.ejs");
            if (data?.metadata?.orderId) {
                await order_model_1.Order.findByIdAndUpdate(data?.metadata?.orderId, { paid: true }).then(async (order) => {
                    await (0, PlaceOrder_1.PlaceOrder)(order);
                });
            }
            else {
                const { reference, id, status } = (0, lodash_1.pick)(data, [
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
                console.log(subscription);
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
            }
        }).then(() => res.render("payment-success.ejs"))
            .catch((error) => {
            console.log(error);
            return res.render("payment-error.ejs");
        });
    }
    catch (error) {
        console.log(error);
        res.render("payment-error.ejs");
    }
}
exports.GetChargeDetails = GetChargeDetails;
async function GetInvoiceDetails(req, res, next) {
    try {
        const { tap_id } = (0, lodash_1.pick)(req.query, ["tap_id"]);
        if (!tap_id || !/^inv_/gi.test(tap_id))
            return res.render("payment-error.ejs");
        TPayment.GetInvoiceDetails(tap_id)
            .then(({ data }) => {
            console.log('invoice=>' + data);
            if (data.status !== "PAID")
                return res.render("payment-error.ejs");
            return res.render("payment-success.ejs");
        })
            .catch((error) => {
            console.log(error);
            return res.render("payment-error.ejs");
        });
    }
    catch (error) {
        res.render("payment-error.ejs");
    }
}
exports.GetInvoiceDetails = GetInvoiceDetails;
