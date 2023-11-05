"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const axios_1 = __importDefault(require("axios"));
const GenerateSignature_1 = require("./features/GenerateSignature");
const settings_1 = __importDefault(require("../settings"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
async function MakeRequest(values) {
    const timestamp = new Date((0, dayjs_1.default)().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")).getTime();
    const [ALI_APP_KEY, ALI_BASE, ALI_TOKEN, ALI_REFRESH] = await Promise.all([
        (0, settings_1.default)("ALI_APP_KEY"),
        (0, settings_1.default)("ALI_BASE"),
        (0, settings_1.default)("ALI_TOKEN"),
        (0, settings_1.default)("ALI_REFRESH_TOKEN"),
    ]);
    const data = {
        ...values,
        app_key: ALI_APP_KEY,
        access_token: ALI_TOKEN,
        timestamp,
    };
    const sign = (0, GenerateSignature_1.GenerateSign)((0, GenerateSignature_1.GenerateValues)(data));
    return (0, axios_1.default)({
        url: ALI_BASE + "/" + values?.method,
        method: "post",
        data: {
            ...data,
            sign,
        },
    });
}
exports.default = MakeRequest;
