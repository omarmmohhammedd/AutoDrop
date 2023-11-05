"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dayjs_1 = __importDefault(require("dayjs"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const settings_model_1 = require("../../models/settings.model");
const settings_1 = __importDefault(require("../settings"));
const GenerateSignature_1 = require("./features/GenerateSignature");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
async function MakeRequest(values) {
    const timestamp = new Date((0, dayjs_1.default)().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")).getTime();
    let access_token;
    const [ALI_APP_KEY, ALI_BASE, ALI_TOKEN, ALI_REFRESH, ALI_SECRET] = await Promise.all([
        (0, settings_1.default)("ALI_APP_KEY"),
        (0, settings_1.default)("ALI_BASE"),
        (0, settings_1.default)("ALI_TOKEN"),
        (0, settings_1.default)("ALI_REFRESH"),
        (0, settings_1.default)("ALI_SECRET"),
        (0, settings_1.default)("ALI_ACCESS_TOKEN_EXPIRE_DATE"),
    ]);
    access_token = ALI_TOKEN;
    // const currentTime = Date.now();
    // const isExpired = Number(ALI_ACCESS_TOKEN_EXPIRE_DATE) < currentTime;
    // if (isExpired) {
    //   await updateAliExpressTokens(
    //     ALI_APP_KEY,
    //     ALI_BASE,
    //     ALI_REFRESH,
    //     ALI_SECRET
    //   );
    //   access_token = await findSettingKey("ALI_TOKEN");
    // }
    const data = {
        app_key: ALI_APP_KEY,
        ...(access_token && { access_token }),
        timestamp,
        sign_method: "sha256",
        ...values,
    };
    const sign = (0, GenerateSignature_1.GenerateSign)((0, GenerateSignature_1.GenerateValues)(data), ALI_SECRET);
    const body = { ...data, sign };
    console.log(body);
    return (0, axios_1.default)({
        url: ALI_BASE,
        method: "post",
        data: body,
    });
}
exports.default = MakeRequest;
async function updateAliExpressTokens(app_key, base, refresh_token, secret) {
    try {
        const timestamp = new Date((0, dayjs_1.default)().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")).getTime();
        const method = "/auth/token/refresh";
        const body = {
            app_key,
            refresh_token,
            sign_method: "sha256",
            timestamp,
            method,
        };
        const sign = (0, GenerateSignature_1.GenerateSign)((0, GenerateSignature_1.GenerateValues)(body), secret);
        const { data } = await axios_1.default.get(base, {
            params: { ...body, sign },
        });
        const key = method + "_response";
        const result = data[key];
        await Promise.all([
            settings_model_1.Setting.findOneAndUpdate({
                key: "ALI_TOKEN",
            }, { $set: { value: result.access_token } }, { new: true }),
            settings_model_1.Setting.findOneAndUpdate({
                key: "ALI_REFRESH",
            }, { $set: { value: result.refresh_token } }, { new: true }),
            settings_model_1.Setting.findOneAndUpdate({
                key: "ALI_ACCESS_TOKEN_EXPIRE_DATE",
            }, { $set: { value: result.expire_time } }, { new: true }),
            settings_model_1.Setting.findOneAndUpdate({
                key: "ALI_REFRESH_TOKEN_EXPIRE_DATE",
            }, { $set: { value: result.refresh_token_valid_time } }, { new: true }),
        ]);
    }
    catch (error) {
        console.log("there is something went wrong while updating tokens => ", error.response.data);
    }
}
