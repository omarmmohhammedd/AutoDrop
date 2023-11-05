"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = exports.DB_URL = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const generator_1 = require("../features/generator");
const mongoPaginate_1 = require("../features/mongoPaginate");
const extension_model_1 = require("../models/extension.model");
const plan_model_1 = require("../models/plan.model");
const settings_model_1 = require("../models/settings.model");
const user_model_1 = require("../models/user.model");
const options = {
    maxIdleTimeMS: 80000,
    serverSelectionTimeoutMS: 80000,
    socketTimeoutMS: 0,
    connectTimeoutMS: 0,
    // replicaSet: "rs",
};
const DB = mongoose_1.default
    .set("strictQuery", false)
    .set("toJSON", {
    virtuals: true,
    transform: function (_doc, ret, _options) {
        delete ret._id;
        delete ret.__v;
    },
})
    .plugin(mongoPaginate_1.mongoPaginate);
const { DB_PASS, DB_USERNAME, DB_NAME, DB_MEMBER } = process.env;
const password = encodeURIComponent(DB_PASS);
const username = encodeURIComponent(DB_USERNAME);
const db = encodeURIComponent(DB_NAME);
const member = encodeURIComponent(DB_MEMBER);
const params = new URLSearchParams({
    retryWrites: "true",
    w: "majority",
}).toString();
const DB_URL = `mongodb+srv://${username}:${password}@${member}/${db}?${params}`;
exports.DB_URL = DB_URL;
// const DB_URL = process.env.DB_DEV_URL as string;
function connection() {
    return new Promise((resolve, reject) => {
        DB.connect(DB_URL, options, async (err) => {
            if (err)
                return reject(err);
            const [admin, defaultPlan, settingsCount, sallaExtension] = await Promise.all([
                user_model_1.User.findOne({ userType: "admin" }).exec(),
                plan_model_1.Plan.findOne({ is_default: true }).exec(),
                settings_model_1.Setting.countDocuments().exec(),
                extension_model_1.Extension.findOne({ type: "salla" }).exec(),
            ]);
            const password = (0, generator_1.HashPassword)("123456789");
            await Promise.all([
                !settingsCount && loadDefaultSettingsValues(),
                !admin &&
                    user_model_1.User.create({
                        name: "Admin",
                        email: "admin@autodrop.me",
                        password,
                        userType: "admin",
                    }),
                !defaultPlan &&
                    plan_model_1.Plan.create({
                        name: "Basic",
                        description: "Enjoy 7 days trial with the default plan",
                        is_default: true,
                        orders_limit: 5,
                        products_limit: 5,
                    }),
                !sallaExtension &&
                    extension_model_1.Extension.create({
                        client_id: "a0f71e43-f927-431c-bc3c-28cd9603c932",
                        client_secret: "a4ba69dff1dddf7f054a09c72d130832",
                        name: "Salla",
                        baseUrl: "https://api.salla.dev/admin/v2/",
                        webhookSignature: "309e9d004c5d10f563761aa6fd6f572d",
                        type: "salla",
                        appId: "1931877074",
                    }),
            ]);
            return resolve(true);
        });
    });
}
exports.connection = connection;
async function loadDefaultSettingsValues() {
    return new Promise((resolve, reject) => {
        const keys = [
            // ["SALLA_ENDPOINT", "https://api.salla.dev/admin/v2/"],
            // ["SALLA_WEBHOOK_TOKEN", "b2fb8c14daca164de5c3c070338ea66f"],
            // ["SALLA_CLIENT_ID", "84807a3f-6348-4606-8d64-418117ec0ff1"],
            // ["SALLE_CLIENT_SECRECT", "879f9e1184a69135b7eceeb378429cb6"],
            ["ALI_BASE", "https://api-sg.aliexpress.com/sync"],
            ["TAB_BASE", "https://api.tap.company/v2/"],
            ["TAB_TAX", "3.75"],
            ["TAB_ORDERS_TAX", "7"],
        ];
        const loadSettingsKeys = keys.map(([key, value]) => ({ key, value }));
        settings_model_1.Setting.insertMany(loadSettingsKeys, (err, result) => {
            if (err)
                return reject({
                    message: "There is something went wrong while inserting default setting keys",
                    err,
                });
            resolve(true);
        });
    });
}
