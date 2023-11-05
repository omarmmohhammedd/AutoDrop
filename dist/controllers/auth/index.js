"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUser = exports.CreateNewUser = exports.GetAllUsers = exports.GetProfile = exports.DeleteProfile = exports.UpdateProfile = exports.ChangePassword = exports.VerifyOTP = exports.SendOTP = exports.Login = void 0;
const lodash_1 = require("lodash");
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = require("mongoose");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const ModelsFactor_1 = __importDefault(require("../../features/ModelsFactor"));
const baseApi_1 = __importDefault(require("../../features/baseApi"));
const generateOptions_1 = __importDefault(require("../../features/email/generateOptions"));
const send_1 = __importDefault(require("../../features/email/send"));
const generator_1 = require("../../features/generator");
const jwt_1 = require("../../features/jwt");
const access_model_1 = require("../../models/access.model");
const otp_model_1 = require("../../models/otp.model");
const plan_model_1 = require("../../models/plan.model");
const store_model_1 = require("../../models/store.model");
const subscription_model_1 = require("../../models/subscription.model");
const user_model_1 = require("../../models/user.model");
const messages_1 = require("../../responses/messages");
function GenerateOTP() {
    return Math.floor(Math.random() * (999999 - 100000) + 10000).toString();
}
class AuthController extends baseApi_1.default {
    async Login(req, res, next) {
        try {
            const { email } = (0, lodash_1.pick)(req.body, ["email"]);
            const account = await user_model_1.User.findOne({ email }).exec();
            if (!account)
                throw new ApiError_1.default("UnprocessableEntity", "Account not fond");
            const [store, tokens] = await Promise.all([
                store_model_1.Store.findOne({ userId: account.id }).exec(),
                access_model_1.Token.findOne({ userId: account.id }).exec(),
            ]);
            const token = (0, jwt_1.GenerateToken)({
                userType: account?.userType,
                userId: account?.id,
                storeId: store?.id,
                tokenId: tokens?.id,
            });
            // update deleted date to null every time
            account.deletedAt = null;
            // check if current user has subscription or not to set default plan.
            if (account.userType === "vendor") {
                const subscription = await subscription_model_1.Subscription.findOne({
                    user: account.id,
                }).exec();
                if (!subscription) {
                    const plan = await plan_model_1.Plan.findOne({ is_default: true }).exec();
                    if (plan) {
                        const currentDate = (0, moment_1.default)().toDate();
                        const nextPayment = (0, moment_1.default)().add(7, "days").toDate();
                        await subscription_model_1.Subscription.create({
                            plan: plan?.id,
                            orders_limit: plan?.orders_limit,
                            products_limit: plan?.products_limit,
                            start_date: currentDate,
                            expiry_date: nextPayment,
                            user: account.id,
                        });
                    }
                }
            }
            await account.save();
            super.send(res, { access_token: token });
        }
        catch (error) {
            next(error);
        }
    }
    async SendOTP(req, res, next) {
        try {
            let token;
            const { email, redirect } = (0, lodash_1.pick)(req.body, ["email", "redirect"]);
            const account = await user_model_1.User.findOne({ email }).exec();
            if (!account)
                throw new ApiError_1.default("NotFound");
            const OTPValue = GenerateOTP();
            const value = (0, generator_1.HashPassword)(OTPValue);
            const otp = await otp_model_1.OTP.create({ value, user: account.id });
            token = (0, jwt_1.GenerateToken)({
                email,
                value: OTPValue,
                hash: otp.id,
            });
            const options = (0, generateOptions_1.default)(account?.email, 
            // "frontdev0219@gmail.com",
            messages_1.messages["reset-password"], {
                "{{_NAME_}}": account?.name,
                "{{_REDIRECT_}}": redirect + "?otp=" + token,
            });
            await (0, send_1.default)(options);
            super.send(res, {
                message: "Email has been sent successfully via email address you entered, visit your inbox",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async VerifyOTP(req, res, next) {
        try {
            const { otp } = (0, lodash_1.pick)(req.query, ["otp"]);
            if (!otp)
                throw new ApiError_1.default("UnprocessableEntity", "Invalid OTP");
            const matched = await (0, jwt_1.VerifyToken)(otp);
            if (!matched)
                throw new ApiError_1.default("UnprocessableEntity", "Invalid OTP");
            const { hash, email, value } = matched;
            if (!(0, mongoose_1.isValidObjectId)(hash))
                throw new ApiError_1.default("UnprocessableEntity", "OTP Not found");
            const checkOTP = await otp_model_1.OTP.findById(hash).exec();
            if (!checkOTP)
                throw new ApiError_1.default("UnprocessableEntity", "OTP expired!");
            const OTPMatched = (0, generator_1.CompareHash)(value, checkOTP.value);
            if (!OTPMatched)
                throw new ApiError_1.default("UnprocessableEntity", "OTP not matched!");
            await checkOTP.delete();
            super.send(res, {
                message: "OTP verified successfully, you can reset password now",
                result: {
                    email,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async ChangePassword(req, res, next) {
        try {
            let password;
            const { email, ...data } = (0, lodash_1.pick)(req.body, [
                "email",
                "new-password",
                "confirmation-password",
            ]);
            password = (0, generator_1.HashPassword)(data["new-password"]);
            user_model_1.User.findOneAndUpdate({
                email,
            }, {
                $set: {
                    password: password,
                },
            }, { new: true }, (err, result) => {
                if (err)
                    return next(new ApiError_1.default("InternalServerError", "Something went wrong while updating password info"));
                if (!result)
                    return next(new ApiError_1.default("InternalServerError", "There is no account available"));
                super.send(res, "Password updated successfully");
            });
        }
        catch (error) {
            next(error);
        }
    }
    async UpdateProfile(req, res, next) {
        try {
            const { email, ...data } = (0, lodash_1.pick)(req.body, ["email", "mobile", "name"]);
            user_model_1.User.findOneAndUpdate({
                email,
            }, {
                $set: {
                    email,
                    ...data,
                },
            }, { new: true }, (err, result) => {
                if (err)
                    return next(new ApiError_1.default("InternalServerError", "Something went wrong while updating profile info"));
                if (!result)
                    return next(new ApiError_1.default("InternalServerError", "There is no account available"));
                super.send(res, {
                    message: "Profile updated successfully",
                });
            });
        }
        catch (error) {
            next(error);
        }
    }
    async DeleteProfile(req, res, next) {
        try {
            const { userType } = (0, lodash_1.pick)(req.local, ["userType"]);
            const { id } = (0, lodash_1.pick)(req.body, ["id"]);
            if (userType === "admin") {
                const counts = await user_model_1.User.countDocuments({ userType: "admin" });
                if (counts === 1) {
                    throw new ApiError_1.default("Forbidden", "You cannot delete this account, try to add another one then delete it anytime you want.");
                }
            }
            user_model_1.User.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true }, async (err, result) => {
                if (err)
                    return next(new ApiError_1.default("InternalServerError", "Something went wrong while deleting account info"));
                if (!result)
                    return next(new ApiError_1.default("InternalServerError", "There is no account available"));
                const options = (0, generateOptions_1.default)(
                // userInfo?.email,
                "frontdev0219@gmail.com", messages_1.messages["delete-account"], {
                    "{{_NAME_}}": result?.name,
                });
                await (0, send_1.default)(options);
                super.send(res, "Account deleted successfully");
            });
        }
        catch (error) {
            next(error);
        }
    }
    async GetProfile(req, res, next) {
        try {
            const { user_id } = (0, lodash_1.pick)(req.local, ["user_id"]);
            let result;
            const account = await user_model_1.User.findById(user_id)
                .select("name email mobile avatar userType pt_customer_id pt_default_card_id pt_card_ids")
                .exec();
            if (!account)
                throw new ApiError_1.default("NotFound");
            result = { account };
            if (account.userType === "vendor") {
                const [subscription, store] = await Promise.all([
                    subscription_model_1.Subscription.findOne({
                        user: account.id,
                    })
                        .populate("plan")
                        .exec(),
                    store_model_1.Store.findOne({
                        userId: account.id,
                    }).exec(),
                ]);
                result = {
                    ...result,
                    store,
                    subscription,
                };
            }
            super.send(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async GetAllUsers(req, res, next) {
        try {
            const { page, userType, search_key } = (0, lodash_1.pick)(req.query, [
                "page",
                "userType",
                "search_key",
            ]);
            const query = {
                ...(userType && { userType }),
            };
            const select = "name email mobile userType createdAt avatar id";
            const users = page
                ? await (0, ModelsFactor_1.default)(user_model_1.User, { page, search_key, select }, query)
                : await user_model_1.User.find(query).select(select);
            super.send(res, { users });
        }
        catch (error) {
            next(error);
        }
    }
    async CreateNewUser(req, res, next) {
        try {
            let password;
            const { userType, ...data } = (0, lodash_1.pick)(req.body, [
                "name",
                "email",
                "password",
                "mobile",
                "userType",
            ]);
            password = (0, generator_1.HashPassword)(data["password"]);
            const user = new user_model_1.User({
                ...data,
                userType: userType || "admin",
                password,
            });
            user.save((err, result) => {
                if (err)
                    return next(new ApiError_1.default("InternalServerError", "Something went wrong while adding new user"));
                super.send(res, "User added successfully!");
            });
        }
        catch (error) {
            next(error);
        }
    }
    async UpdateUser(req, res, next) {
        try {
            const { id, ...data } = (0, lodash_1.pick)(req.body, ["name", "email", "mobile", "id"]);
            user_model_1.User.findByIdAndUpdate(id, { $set: { ...data } }, { new: true }, (err, result) => {
                if (err)
                    return next(new ApiError_1.default("InternalServerError", "Something went wrong while updating"));
                if (!result)
                    return next(new ApiError_1.default("NotFound", "Account not found"));
                super.send(res, "Account updated successfully");
            });
        }
        catch (error) {
            next(error);
        }
    }
}
_a = new AuthController(), exports.Login = _a.Login, exports.SendOTP = _a.SendOTP, exports.VerifyOTP = _a.VerifyOTP, exports.ChangePassword = _a.ChangePassword, exports.UpdateProfile = _a.UpdateProfile, exports.DeleteProfile = _a.DeleteProfile, exports.GetProfile = _a.GetProfile, exports.GetAllUsers = _a.GetAllUsers, exports.CreateNewUser = _a.CreateNewUser, exports.UpdateUser = _a.UpdateUser;
