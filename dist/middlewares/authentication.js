"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckTokenExpire = void 0;
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const jwt_1 = require("../features/jwt");
const access_model_1 = require("../models/access.model");
const extension_model_1 = require("../models/extension.model");
const store_model_1 = require("../models/store.model");
const user_model_1 = require("../models/user.model");
function Authentication(role) {
    return async function (req, res, next) {
        try {
            let result;
            const token = req.headers["authorization"];
            if (!token)
                throw new ApiError_1.default("404");
            const matched = await (0, jwt_1.VerifyToken)(token.replace(/Bearer /, "")).catch((error) => next(new ApiError_1.default("Unauthorized", error)));
            if (!matched)
                throw new ApiError_1.default("MethodNotAllowed");
            if (role === "admin" && matched?.userType === "vendor")
                throw new ApiError_1.default("Forbidden", "You do not have any access to do this action");
            const { userId, storeId, tokenId, userType } = matched;
            const [account, store, storeToken] = await Promise.all([
                user_model_1.User.findById(userId).exec(),
                store_model_1.Store.findById(storeId).exec(),
                access_model_1.Token.findById(tokenId).exec(),
            ]);
            if (!account)
                throw new ApiError_1.default("UnprocessableEntity", "Account not found");
            result = {
                user_id: userId,
                user_type: userType,
            };
            if (userType === "vendor") {
                if (!store)
                    throw new ApiError_1.default("UnprocessableEntity", "Store not found");
                const access_token = await checkStoreToken(store?.extension, storeToken);
                result = {
                    user_id: userId,
                    store_id: storeId,
                    access_token,
                };
            }
            req.local = result;
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = Authentication;
function CheckTokenExpire(token) {
    let expired = false;
    const { access_token, expires, refresh_token } = JSON.parse(token);
    expired = new Date().getTime() > new Date(expires * 1000).getTime();
    return expired ? refresh_token : access_token;
}
exports.CheckTokenExpire = CheckTokenExpire;
async function checkStoreToken(extensionId, storeToken) {
    return new Promise(async (resolve, reject) => {
        console.log(extensionId);
        const extension = await extension_model_1.Extension.findById(extensionId).exec();
        if (!extension)
            return reject(new ApiError_1.default("UnprocessableEntity", "Store extension is invalid"));
        const { client_id, client_secret, baseUrl } = extension;
        const { refresh_token, access_token, expires } = storeToken;
        const currentTime = Date.now();
        const expiresTime = new Date(expires * 1000).getTime();
        if (expiresTime > currentTime)
            return resolve(access_token);
        return resolve(refresh_token);
    });
}
