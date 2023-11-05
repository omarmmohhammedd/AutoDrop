"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeApp = void 0;
const axios_1 = __importDefault(require("axios"));
const dayjs_1 = __importDefault(require("dayjs"));
const lodash_1 = require("lodash");
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const GenerateSignature_1 = require("../../features/aliExpress/features/GenerateSignature");
const baseApi_1 = __importDefault(require("../../features/baseApi"));
const settings_1 = __importDefault(require("../../features/settings"));
const settings_model_1 = require("../../models/settings.model");
class AliExpressController extends baseApi_1.default {
    async initializeApp(req, res, next) {
        let session = null;
        session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const timestamp = new Date((0, dayjs_1.default)().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")).getTime();
            const { code, app_key, secret } = (0, lodash_1.pick)(req.body, [
                "code",
                "app_key",
                "secret",
            ]);
            const method = "/auth/token/create";
            const data = {
                code,
                app_key,
                uuid: "code" + app_key,
                sign_method: "sha256",
                timestamp,
                method,
            };
            const base = await (0, settings_1.default)("ALI_BASE");
            const values = (0, GenerateSignature_1.GenerateValues)(data);
            const sign = (0, GenerateSignature_1.GenerateSign)(values);
            const params = {
                ...data,
                sign,
            };
            const result = await axios_1.default.post(base, params);
            const response = result.data;
            const initResponse = response[method + "_response"];
            const error = response.error_response;
            if (error) {
                const message = error.msg
                    ? { error: error.msg }
                    : "Something went wrong while linking by authentication code, secret and app key, try again later or try another code.";
                throw new ApiError_1.default("UnprocessableEntity", message);
            }
            const { access_token, refresh_token, expire_time, refresh_token_valid_time, } = (0, lodash_1.pick)(initResponse, [
                "access_token",
                "refresh_token",
                "expire_time",
                "refresh_token_valid_time",
            ]);
            const codeExpireDate = (0, moment_1.default)().add(30, "minutes").toDate().getTime();
            const AEKeys = [
                {
                    key: "ALI_TOKEN",
                    value: access_token,
                    start_date: Date.now(),
                    end_date: expire_time,
                },
                {
                    key: "ALI_APP_KEY",
                    value: app_key,
                },
                {
                    key: "ALI_SECRET",
                    value: secret,
                },
                {
                    key: "ALI_REFRESH_TOKEN",
                    value: refresh_token,
                    start_date: Date.now(),
                    end_date: refresh_token_valid_time,
                },
                {
                    key: "ALI_AUTH_CODE",
                    value: code,
                    start_date: Date.now(),
                    end_date: codeExpireDate,
                },
            ];
            // delete aliexpress keys first
            await settings_model_1.Setting.deleteMany({
                key: {
                    $in: [
                        "ALI_TOKEN",
                        "ALI_REFRESH_TOKEN",
                        "ALI_AUTH_CODE",
                        "ALI_SECRET",
                        "ALI_APP_KEY",
                    ],
                },
            }, { session });
            // store all new values by keys
            await settings_model_1.Setting.insertMany(AEKeys, { session });
            await session.commitTransaction();
            super.send(res, "Application initialized successfully");
        }
        catch (error) {
            console.log(error);
            next(error);
            await session.abortTransaction();
        }
        finally {
            await session.endSession();
        }
    }
}
exports.initializeApp = new AliExpressController().initializeApp;
