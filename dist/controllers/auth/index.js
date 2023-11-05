"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUser = exports.CreateNewUser = exports.GetAllUsers = exports.GetProfile = exports.DeleteProfile = exports.ChangePassword = exports.UpdateProfile = exports.VerifyOTP = exports.SendOTP = exports.Login = exports.VerifySentToken = void 0;
const user_model_1 = require("../../models/user.model");
const jwt_1 = require("../../features/jwt");
const lodash_1 = require("lodash");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const generator_1 = require("../../features/generator");
const subscription_model_1 = require("../../models/subscription.model");
const generateOptions_1 = __importDefault(require("../../features/email/generateOptions"));
const messages_1 = require("../../responses/messages");
const send_1 = __importDefault(require("../../features/email/send"));
const ModelsFactor_1 = __importDefault(require("../../features/ModelsFactor"));
const otp_model_1 = require("../../models/otp.model");
const mongoose_1 = require("mongoose");
const plan_model_1 = require("../../models/plan.model");
const moment_1 = __importDefault(require("moment"));
async function VerifySentToken(req, res, next) {
    try {
        const { access_token } = (0, lodash_1.pick)(req.query, ["access_token"]);
        if (!access_token)
            return res.end();
        const matched = await (0, jwt_1.VerifyToken)(access_token);
        if (!matched)
            return res.end();
        const { token } = matched;
        res.json({
            message: "success",
            token: JSON.parse(token)?.access_token,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.VerifySentToken = VerifySentToken;
async function Login(req, res, next) {
    try {
        let token;
        const { email } = (0, lodash_1.pick)(req.body, ["email"]);
        const account = await user_model_1.User.findOne({ email }).exec();
        if (!account)
            throw new ApiError_1.default("NotFound");
        token = (0, jwt_1.GenerateToken)({
            ...(account?.userType === "vendor"
                ? { merchant: account?.merchantId, token: account?.tokens }
                : {}),
            userType: account?.userType,
            userId: account?.id,
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
        res.json({
            access_token: token,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.Login = Login;
async function SendOTP(req, res, next) {
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
        const options = (0, generateOptions_1.default)(
        // userInfo?.email,
        "frontdev0219@gmail.com", messages_1.messages["reset-password"], {
            "{{_NAME_}}": account?.name,
            "{{_REDIRECT_}}": redirect + "?otp=" + token,
        });
        await (0, send_1.default)(options);
        res.json({
            message: "Email has been sent successfully via email address you entered, visit your inbox",
        });
    }
    catch (error) {
        next(error);
    }
}
exports.SendOTP = SendOTP;
async function VerifyOTP(req, res, next) {
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
        res.json({
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
exports.VerifyOTP = VerifyOTP;
async function UpdateProfile(req, res, next) {
    try {
        const { email, ...data } = (0, lodash_1.pick)(req.body, ["email", "mobile", "name"]);
        user_model_1.User.findOneAndUpdate({
            email,
        }, {
            $set: {
                email,
                ...data,
            },
        }, { new: true }, function (err, result) {
            if (err)
                return next(new ApiError_1.default("InternalServerError", "Something went wrong while updating profile info"));
            if (!result)
                return next(new ApiError_1.default("InternalServerError", "There is no account available"));
            res.json({
                message: "Profile updated successfully",
            });
        });
    }
    catch (error) {
        next(error);
    }
}
exports.UpdateProfile = UpdateProfile;
async function ChangePassword(req, res, next) {
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
        }, { new: true }, function (err, result) {
            if (err)
                return next(new ApiError_1.default("InternalServerError", "Something went wrong while updating password info"));
            if (!result)
                return next(new ApiError_1.default("InternalServerError", "There is no account available"));
            res.json({
                message: "Password updated successfully",
            });
        });
    }
    catch (error) {
        next(error);
    }
}
exports.ChangePassword = ChangePassword;
async function DeleteProfile(req, res, next) {
    try {
        const { userType } = (0, lodash_1.pick)(req.local, ["userType"]);
        const { id } = (0, lodash_1.pick)(req.body, ["id"]);
        console.log("userType", userType, req.local);
        if (userType === "admin") {
            const counts = await user_model_1.User.countDocuments({ userType: "admin" });
            if (counts === 1) {
                throw new ApiError_1.default("Forbidden", "You cannot delete this account, try to add another one then delete it anytime you want.");
            }
        }
        user_model_1.User.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true }, async function (err, result) {
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
            res.json({
                message: "Account deleted successfully",
            });
        });
    }
    catch (error) {
        next(error);
    }
}
exports.DeleteProfile = DeleteProfile;
async function GetProfile(req, res, next) {
    try {
        const { user_id } = (0, lodash_1.pick)(req.local, ["user_id"]);
        const account = await user_model_1.User.findById(user_id)
            .select("name email mobile avatar userType pt_customer_id pt_default_card_id pt_card_ids")
            .exec();
        if (!account)
            throw new ApiError_1.default("NotFound");
        const subscription = await subscription_model_1.Subscription.findOne({
            user: account.id,
        })
            .populate("plan")
            .exec();
        res.json({ account, subscription });
    }
    catch (error) {
        next(error);
    }
}
exports.GetProfile = GetProfile;
async function GetAllUsers(req, res, next) {
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
        res.json(users);
    }
    catch (error) {
        next(error);
    }
}
exports.GetAllUsers = GetAllUsers;
async function CreateNewUser(req, res, next) {
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
        user.save(function (err, result) {
            if (err)
                return next(new ApiError_1.default("InternalServerError", "Something went wrong while adding new user"));
            res.json({ message: "User added successfully!" });
        });
    }
    catch (error) {
        next(error);
    }
}
exports.CreateNewUser = CreateNewUser;
async function UpdateUser(req, res, next) {
    try {
        const { id, ...data } = (0, lodash_1.pick)(req.body, ["name", "email", "mobile", "id"]);
        user_model_1.User.findByIdAndUpdate(id, { $set: { ...data } }, { new: true }, function (err, result) {
            if (err)
                return next(new ApiError_1.default("InternalServerError", "Something went wrong while updating"));
            if (!result)
                return next(new ApiError_1.default("NotFound", "Account not found"));
            res.json({ message: "Account updated successfully" });
        });
    }
    catch (error) {
        next(error);
    }
}
exports.UpdateUser = UpdateUser;
function GenerateOTP() {
    return Math.floor(Math.random() * (999999 - 100000) + 10000).toString();
}
