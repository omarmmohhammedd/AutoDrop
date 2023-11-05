"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckSubscription = void 0;
const moment_1 = __importDefault(require("moment"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const subscription_model_1 = require("../../models/subscription.model");
async function CheckSubscription(user, key) {
    return new Promise(async (resolve, reject) => {
        try {
            const subscription = await subscription_model_1.Subscription.findOne({ user })
                .populate("plan")
                .exec();
            if (!subscription)
                throw new ApiError_1.default("Forbidden", "You do not have any subscription to be able to do this process, subscribe to one of our awesome plans then try again later.");
            const requiredSearchKey = subscription[key];
            const requiredPlanSearch = subscription.plan[key];
            const remainingFromExpire = (0, moment_1.default)(subscription.expiry_date).diff((0, moment_1.default)(), "days", true);
            // throw error when current subscription expired
            if (!remainingFromExpire)
                throw new ApiError_1.default("Forbidden", "Your subscription has been ended, please upgrade it then try again later");
            // throw error when current subscription limit ended
            if (requiredSearchKey === 0)
                throw new ApiError_1.default("Forbidden", "You cannot do this process at that moment, upgrade your subscription first.");
            // unlimited items
            if (requiredSearchKey === null && requiredPlanSearch === null)
                return resolve(subscription);
            resolve(subscription);
            // if(subscription[])
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.CheckSubscription = CheckSubscription;
