"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToken = void 0;
const axios_1 = __importDefault(require("axios"));
const dayjs_1 = __importDefault(require("dayjs"));
const lodash_1 = require("lodash");
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = __importDefault(require("../../../../errors/ApiError"));
const settings_model_1 = require("../../../../models/settings.model");
const GenerateSignature_1 = require("../GenerateSignature");
async function updateToken() {
    return new Promise(async (resolve, reject) => {
        let session = null;
        session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const keys = await settings_model_1.Setting.find({
                key: {
                    $in: ["ALI_APP_KEY", "ALI_REFRESH_TOKEN", "ALI_SECRET", "ALI_BASE"],
                },
            }).exec();
            if (!keys || !keys.length)
                return reject(new ApiError_1.default("InternalServerError", "Application not installed"));
            const app_key = findSettingItem(keys, "ALI_APP_KEY");
            const refresh_token = findSettingItem(keys, "ALI_REFRESH_TOKEN");
            const secret = findSettingItem(keys, "ALI_SECRET");
            const base = findSettingItem(keys, "ALI_BASE");
            const timestamp = new Date((0, dayjs_1.default)().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")).getTime();
            const method = "/auth/token/refresh";
            const body = {
                app_key,
                refresh_token,
                sign_method: "sha256",
                timestamp,
                method,
            };
            const values = (0, GenerateSignature_1.GenerateValues)(body);
            const sign = (0, GenerateSignature_1.GenerateSign)(values);
            const { data } = await axios_1.default.get(base, {
                params: { ...body, sign },
            });
            const key = method + "_response";
            const result = data[key];
            const error = data.error_response;
            console.log(error);
            if (error)
                throw new ApiError_1.default("UnprocessableEntity", error.msg || "Something went wrong while updating application tokens");
            const { access_token, refresh_token: _refresh_token, expire_time, refresh_token_valid_time, } = (0, lodash_1.pick)(result, [
                "access_token",
                "refresh_token",
                "expire_time",
                "refresh_token_valid_time",
            ]);
            const AEKeys = [
                {
                    key: "ALI_TOKEN",
                    value: access_token,
                    start_date: Date.now(),
                    end_date: expire_time,
                },
                {
                    key: "ALI_REFRESH_TOKEN",
                    value: _refresh_token,
                    start_date: Date.now(),
                    end_date: refresh_token_valid_time,
                },
            ];
            // delete aliexpress keys first
            await settings_model_1.Setting.deleteMany({
                key: {
                    $in: ["ALI_TOKEN", "ALI_REFRESH_TOKEN"],
                },
            }, { session });
            // store all new values by keys
            await settings_model_1.Setting.insertMany(AEKeys, { session });
            await session.commitTransaction();
            resolve("Application tokens updated successfully.");
        }
        catch (error) {
            await session.abortTransaction();
            console.log(error);
            reject(error);
        }
        finally {
            await session.endSession();
        }
    });
}
exports.updateToken = updateToken;
function findSettingItem(items, key) {
    const item = items.find((item) => item.key == key);
    return item?.value;
}
