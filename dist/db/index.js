"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_URL = exports.connection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoPaginate_1 = require("../features/mongoPaginate");
const user_model_1 = require("../models/user.model");
const generator_1 = require("../features/generator");
const plan_model_1 = require("../models/plan.model");
const settings_model_1 = require("../models/settings.model");
const options = {
    maxIdleTimeMS: 80000,
    serverSelectionTimeoutMS: 80000,
    socketTimeoutMS: 0,
    connectTimeoutMS: 0,
};
const DB = mongoose_1.default.set("strictQuery", false).set("toJSON", {
    virtuals: true,
    transform: function (_doc, ret, _options) {
        delete ret._id;
        delete ret.__v;
    },
});
mongoose_1.default.plugin(mongoPaginate_1.mongoPaginate);
const password = encodeURIComponent(process.env.DB_PASS);
const username = encodeURIComponent(process.env.DB_USERNAME);
const db = encodeURIComponent(process.env.DB_NAME);
// const DB_URL =
//   "mongodb+srv://" +
//   username +
//   ":" +
//   password +
//   "@atlascluster.map4lmj.mongodb.net/" +
//   db +
//   "?" +
//   new URLSearchParams({
//     retryWrites: "true",
//     w: "majority",
//   }).toString();
const DB_URL = process.env.DB_DEV_URL;
exports.DB_URL = DB_URL;
function connection() {
    return new Promise((resolve, reject) => {
        DB.connect(DB_URL, options, async (err) => {
            if (err)
                return reject(err);
            const [admin, defaultPlan, settingsCount] = await Promise.all([
                user_model_1.User.findOne({ userType: "admin" }).exec(),
                plan_model_1.Plan.findOne({ is_default: true }).exec(),
                settings_model_1.Setting.countDocuments().exec(),
            ]);
            const password = (0, generator_1.HashPassword)("123456789");
            await Promise.all([
                !settingsCount && loadDefaultSettingsValues(),
                !admin &&
                    user_model_1.User.create({
                        name: "Admin",
                        email: "admin@aeauto.com",
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
            ]);
            return resolve(true);
        });
    });
}
exports.connection = connection;
async function loadDefaultSettingsValues() {
    return new Promise((resolve, reject) => {
        const keys = [
            ["SALLA_ENDPOINT", "https://api.salla.dev/admin/v2/"],
            ["SALLA_WEBHOOK_TOKEN", "b2fb8c14daca164de5c3c070338ea66f"],
            ["SALLA_CLIENT_ID", "84807a3f-6348-4606-8d64-418117ec0ff1"],
            ["SALLE_CLIENT_SECRECT", "879f9e1184a69135b7eceeb378429cb6"],
            ["ALI_APP_KEY", "34271827"],
            ["ALI_SECRET", "2c5bcc0958a9d9abd339232f1b31712e"],
            ["ALI_BASE", "https://api-sg.aliexpress.com/sync"],
            [
                "ALI_TOKEN",
                "50000001127zQpnjzgyHLv9SpjZBBxdrT2dlhSg1a7a8445YFUwGf4iuudyKrZa2bOAt",
            ],
            [
                "ALI_REFRESH",
                "50001001827xGh3ksphBFgPelywCGltnXmryDlw167537calQSeQr3PrsyaakL5qLMoL",
            ],
            // ["APP_COMMISSION", "5"],
            // ["LOCAL_HTTP_WEBSOCKET", ""],
            // ["TAB_KEY", "@tappayments/v1.0#sxbqhm94pl47cv1y7"],
            ["TAB_TOKEN", "sk_test_RQDoTzJwgHG21nIYecE0743b"],
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
