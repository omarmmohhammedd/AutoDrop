"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckTokenExpire = void 0;
const jwt_1 = require("../features/jwt");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const user_model_1 = require("../models/user.model");
const Authentication = (role) => async (req, res, next) => {
    try {
        let result, account;
        const token = req.headers["authorization"];
        if (!token)
            throw new ApiError_1.default("404");
        const matched = await (0, jwt_1.VerifyToken)(token.replace(/Bearer /, ""));
        if (!matched)
            throw new ApiError_1.default("MethodNotAllowed");
        if (role === "admin" && matched?.userType === "vendor")
            throw new ApiError_1.default("Forbidden", "You do not have any access to do this action");
        account = await user_model_1.User.findOne(matched?.userType === "vendor"
            ? { merchantId: matched.merchant }
            : { _id: matched.userId }).exec();
        // return error if account not found
        if (!account)
            throw new ApiError_1.default("NotFound");
        if (matched?.userType === "vendor") {
            const access_token = CheckTokenExpire(matched?.token);
            // result.access_token = access_token;
            // result.merchant = matched.merchant;
            result = {
                access_token: access_token,
                merchant: matched.merchant,
            };
        }
        result = {
            ...result,
            user_id: account?.id,
            userType: matched?.userType,
        };
        // console.log(req.session);
        // req.session.user = result;
        req.local = result;
        return next();
    }
    catch (error) {
        next(error);
    }
};
function CheckTokenExpire(token) {
    let expired = false;
    const { access_token, expires, refresh_token } = JSON.parse(token);
    // 1680991559
    expired = new Date().getTime() > new Date(expires * 1000).getTime();
    return expired ? refresh_token : access_token;
}
exports.CheckTokenExpire = CheckTokenExpire;
exports.default = Authentication;
