"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePlan = exports.GetPlanAndVendorTransactions = exports.GetAllSubscriptions = exports.Resubscribe = exports.CreatePaymentToSubscribe = exports.GetSelectedPlan = exports.GetAllPlans = exports.UpdatePlan = exports.CreatePlan = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const lodash_1 = require("lodash");
const plan_model_1 = require("../../models/plan.model");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const mongoose_1 = require("mongoose");
const user_model_1 = require("../../models/user.model");
const subscription_model_1 = require("../../models/subscription.model");
const moment_1 = __importDefault(require("moment"));
const TabPayment_1 = __importDefault(require("../../features/TabPayment"));
const ModelsFactor_1 = __importDefault(require("../../features/ModelsFactor"));
const transaction_model_1 = require("../../models/transaction.model");
const GenerateLocation_1 = __importDefault(require("../../features/GenerateLocation"));
dotenv_1.default.config();
const TPayment = new TabPayment_1.default();
const { LOCAL_HTTP_WEBSOCKET } = process.env;
async function CreatePlan(req, res, next) {
    try {
        // let total: number = 0;
        const { discount_type, discount_value = 0, price = 0, description, is_default, orders_limit, products_limit, name, ...data } = (0, lodash_1.pick)(req.body, [
            "name",
            "description",
            "discount_type",
            "discount_value",
            "orders_limit",
            "products_limit",
            "services",
            "price",
            "is_default",
            "is_monthly",
        ]);
        const default_plan_values = {
            name,
            description,
            is_default,
            orders_limit,
            products_limit,
            services: ["ae_salla"],
        };
        const pricing_values = {
            ...data,
            discount_type,
            discount_value,
            description,
            is_default,
            orders_limit,
            products_limit,
            name,
            price,
            services: ["ae_salla"],
        };
        const plan = new plan_model_1.Plan(is_default ? default_plan_values : pricing_values);
        const anotherPlan = await plan_model_1.Plan.findOne({ is_default: true }).exec();
        if (anotherPlan && is_default)
            throw new ApiError_1.default("UnprocessableEntity", {
                is_default: "There is another plan with default value, only one plan can set as default.",
            });
        if (!is_default) {
            if (discount_type === "fixed") {
                // total = parseFloat((+price - +discount_value).toFixed(2)) || 0;
                plan.discount_price = discount_value;
            }
            else if (discount_type === "percentage") {
                const percentValue = parseFloat(((+price * +discount_value) / 100).toFixed(2));
                plan.discount_price = +percentValue;
                // total = parseFloat((+price - +percentValue).toFixed(2)) || 0;
            }
        }
        plan.save(async function (err, result) {
            if (err)
                return next(new ApiError_1.default("InternalServerError", "Cannot create a new plan at that moment"));
            res.json({ message: "Plan created successfully", result });
        });
    }
    catch (error) {
        next(error);
    }
}
exports.CreatePlan = CreatePlan;
async function UpdatePlan(req, res, next) {
    try {
        let total = 0;
        const { discount_type, discount_value = 0, price = 0, description, is_default, orders_limit, products_limit, name, id, ...data } = (0, lodash_1.pick)(req.body, [
            "name",
            "description",
            "discount_type",
            "discount_value",
            "orders_limit",
            "products_limit",
            "services",
            "price",
            "is_default",
            "is_monthly",
            "id",
        ]);
        const default_plan_values = {
            name,
            description,
            is_default,
            orders_limit,
            products_limit,
            services: ["ae_salla"],
        };
        const pricing_values = {
            ...data,
            discount_type,
            discount_value,
            description,
            is_default,
            orders_limit,
            products_limit,
            name,
            price,
            services: ["ae_salla"],
        };
        const plan = await plan_model_1.Plan.findById(id).exec();
        if (!plan)
            throw new ApiError_1.default("NotFound", "Selected plan is invalid");
        const anotherPlan = await plan_model_1.Plan.findOne({
            is_default: true,
            _id: {
                $ne: id,
            },
        }).exec();
        if (anotherPlan && is_default)
            throw new ApiError_1.default("UnprocessableEntity", {
                is_default: "There is another plan with default value, only one plan can set as default.",
            });
        if (!is_default) {
            if (discount_type === "fixed") {
                // total = parseFloat((+price - +discount_value).toFixed(2)) || 0;
                plan.discount_price = discount_value;
            }
            else if (discount_type === "percentage") {
                const percentValue = parseFloat(((+price * +discount_value) / 100).toFixed(2));
                plan.discount_price = +percentValue;
                // total = parseFloat((+price - +percentValue).toFixed(2)) || 0;
            }
            // plan.price = total;
        }
        plan.save(async function (err, result) {
            if (err)
                return next(new ApiError_1.default("InternalServerError", "Cannot update selected plan at that moment, try again later"));
            await plan_model_1.Plan.findByIdAndUpdate(id, {
                $set: is_default ? default_plan_values : pricing_values,
            }, { new: true });
            res.json({ message: "Plan updated successfully", result });
        });
    }
    catch (error) {
        next(error);
    }
}
exports.UpdatePlan = UpdatePlan;
async function GetAllPlans(req, res, next) {
    try {
        const { page, search_key } = (0, lodash_1.pick)(req.query, ["page", "search_key"]);
        const plans = page
            ? await (0, ModelsFactor_1.default)(plan_model_1.Plan, { page, search_key }, {})
            : await plan_model_1.Plan.find({});
        res.json(plans);
    }
    catch (error) {
        next(error);
    }
}
exports.GetAllPlans = GetAllPlans;
async function GetSelectedPlan(req, res, next) {
    try {
        const { id } = (0, lodash_1.pick)(req.params, ["id"]);
        if (!id || !(0, mongoose_1.isValidObjectId)(id))
            throw new ApiError_1.default("NotFound", "Invalid item");
        const plan = await plan_model_1.Plan.findById(id).exec();
        if (!plan)
            throw new ApiError_1.default("NotFound", "Item not found");
        res.json({ plan });
    }
    catch (error) {
        next(error);
    }
}
exports.GetSelectedPlan = GetSelectedPlan;
async function CreatePaymentToSubscribe(req, res, next) {
    try {
        const { id } = (0, lodash_1.pick)(req.body, ["id"]);
        const { user_id } = (0, lodash_1.pick)(req.local, ["user_id", "userType"]);
        const data = await GenerateChargePayment(req, id, user_id);
        res.json(data);
        // .catch((error: AxiosError | any) => {
        //   const err = error.response;
        //   return next(new ApiError("InternalServerError", ));
        // });
    }
    catch (error) {
        next(error);
    }
}
exports.CreatePaymentToSubscribe = CreatePaymentToSubscribe;
async function Resubscribe(req, res, next) {
    try {
        const { user_id } = (0, lodash_1.pick)(req.local, ["user_id"]);
        const subscription = await subscription_model_1.Subscription.findOne({ user: user_id })
            .populate(["user", "plan"])
            .exec();
        if (!subscription)
            throw new ApiError_1.default("UnprocessableEntity", "You do not have any subscription available, please select one of our awesome plans first");
        const { plan } = subscription.toJSON();
        const currentDate = (0, moment_1.default)().toDate();
        const nextPayment = (0, moment_1.default)()
            .add(1, plan.is_monthly ? "month" : "year")
            .toDate();
        subscription.start_date = currentDate;
        subscription.expiry_date = nextPayment;
        subscription.orders_limit = plan.orders_limit;
        subscription.products_limit = plan.products_limit;
        await subscription.save();
        return res.json({ message: "Your plan has been upgraded successfully!!" });
    }
    catch (error) {
        next(error);
    }
}
exports.Resubscribe = Resubscribe;
async function GetAllSubscriptions(req, res, next) {
    try {
        const { page, search_key } = (0, lodash_1.pick)(req.query, ["page", "search_key"]);
        const subscriptions = await (0, ModelsFactor_1.default)(subscription_model_1.Subscription, {
            page,
            search_key,
            populate: [
                {
                    path: "user",
                    select: "name email avatar mobile",
                },
                "plan",
            ],
        }, {});
        res.json(subscriptions);
    }
    catch (error) {
        console.log("pagination error => ", error);
        next(error);
    }
}
exports.GetAllSubscriptions = GetAllSubscriptions;
async function GetPlanAndVendorTransactions(req, res, next) {
    try {
        const { plan } = (0, lodash_1.pick)(req.body, ["plan"]);
        const { user } = (0, lodash_1.pick)(req.params, ["user"]);
        if (!(0, mongoose_1.isValidObjectId)(user) || !(0, mongoose_1.isValidObjectId)(plan))
            throw new ApiError_1.default("UnprocessableEntity", "Invalid user or plan");
        const transactions = await transaction_model_1.Transaction.find({ user, plan })
            .populate(["plan"])
            .exec();
        res.json(transactions);
    }
    catch (error) {
        console.log("pagination error => ", error);
        next(error);
    }
}
exports.GetPlanAndVendorTransactions = GetPlanAndVendorTransactions;
async function DeletePlan(req, res, next) {
    try {
        const { id } = (0, lodash_1.pick)(req.params, ["id"]);
        if (!(0, mongoose_1.isValidObjectId)(id))
            throw new ApiError_1.default("UnprocessableEntity", "Invalid plan");
        const plan = await plan_model_1.Plan.findById(id).exec();
        if (!plan)
            throw new ApiError_1.default("UnprocessableEntity", "Plan not found");
        const subscriptions = await subscription_model_1.Subscription.countDocuments({
            plan: id,
        }).exec();
        if (subscriptions >= 1)
            throw new ApiError_1.default("UnprocessableEntity", "There are some subscriptions are related to this plan so you cannot delete it.");
        await plan.delete();
        res.json({ message: "Plan deleted successfully!" });
    }
    catch (error) {
        next(error);
    }
}
exports.DeletePlan = DeletePlan;
// added new
function GenerateChargePayment(req, id, user_id) {
    return new Promise(async (resolve, reject) => {
        const location = (0, GenerateLocation_1.default)(req);
        const route = "/v1/payments/callback/subscriptions";
        const [user, plan] = await Promise.all([
            user_model_1.User.findById(user_id).exec(),
            plan_model_1.Plan.findById(id).exec(),
        ]);
        if (!user)
            return reject(new ApiError_1.default("NotFound", "Invalid account"));
        if (!plan)
            return reject(new ApiError_1.default("NotFound", "Selected plan is not available"));
        if (plan.is_default)
            return reject(new ApiError_1.default("UnprocessableEntity", "You cannot subscribe with default plan."));
        const generateId = [user.id, plan.id].join("-");
        const customerSendToPayment = {
            first_name: user.name,
            email: user.email,
        };
        TPayment.CreateCharge({
            currency: "SAR",
            customer: customerSendToPayment,
            order: {
                amount: plan.price,
                items: [
                    {
                        amount: plan.price,
                        currency: "SAR",
                        name: plan.name,
                        quantity: 1,
                    },
                ],
            },
            post: location + route,
            redirect: location + route,
            ref_order: "ref-" + generateId,
            source: undefined,
            amount: 0,
        })
            .then(({ data }) => {
            resolve({ url: data.transaction.url });
        })
            .catch((error) => {
            const err = error?.response?.data;
            reject(err || error);
        });
    });
}
// end.....
function XGenerateSubscriptionInvoice(req, id, user_id) {
    return new Promise(async (resolve, reject) => {
        const location = (0, GenerateLocation_1.default)(req);
        const route = "/api/v1/payments/callback/subscriptions";
        const [user, plan] = await Promise.all([
            user_model_1.User.findById(user_id).exec(),
            plan_model_1.Plan.findById(id).exec(),
        ]);
        if (!user)
            return reject(new ApiError_1.default("NotFound", "Invalid account"));
        if (!plan)
            return reject(new ApiError_1.default("NotFound", "Selected plan is not available"));
        if (plan.is_default)
            return reject(new ApiError_1.default("UnprocessableEntity", "You cannot subscribe with default plan."));
        const generateId = [user.id, plan.id].join("-");
        TPayment.CreateInvoice({
            draft: false,
            due: (0, moment_1.default)().add(1, "days").toDate().getTime(),
            expiry: (0, moment_1.default)().add(2, "days").toDate().getTime(),
            mode: "INVOICEPAY",
            customer: user.pt_customer_id,
            order: {
                amount: plan.price,
                items: [
                    {
                        amount: plan.price,
                        currency: "SAR",
                        name: plan.name,
                        quantity: 1,
                    },
                ],
            },
            post: location + route,
            redirect: location + route,
            ref_invoice: "inv-" + generateId,
            ref_order: "ref-" + generateId,
        })
            .then(({ data }) => {
            resolve({ url: data.url });
        })
            .catch((error) => {
            const err = error?.response?.data;
            reject(err || error);
        });
    });
}
