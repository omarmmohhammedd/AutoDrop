"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlToken = exports.GetStaticSettings = exports.UpdateServerKeys = exports.GetServerKeys = exports.GetDashboard = void 0;
const lodash_1 = require("lodash");
const product_model_1 = require("../../models/product.model");
const order_model_1 = require("../../models/order.model");
const moment_1 = __importDefault(require("moment"));
const features_1 = require("../orders/features");
const user_model_1 = require("../../models/user.model");
const subscription_model_1 = require("../../models/subscription.model");
const transaction_model_1 = require("../../models/transaction.model");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const settings_model_1 = require("../../models/settings.model");
const settingsData = {
    faqs: [
        {
            question_en: "What are the supported platforms for connectivity?",
            question_ar: "ما هي المنصات المدعومة للربط ؟",
            answer_en: "offline salla platform.",
            answer_ar: "منصة سلة حاليا.",
        },
        {
            question_en: "What are the supported sites for linking with stores?",
            question_ar: "ما هي المواقع المدعومة للربط مع المتاجر ؟",
            answer_en: "Ali Express website now.",
            answer_ar: "موقع علي اكسبريس حاليا.",
        },
        {
            question_en: "Is linking to other platforms available in the future?",
            question_ar: "هل يتوفر ربط منصات أخري مستقبلا ؟",
            answer_en: "Yes, soon other platforms will be supported.",
            answer_ar: "نعم ، قريبا سيتم دعم منصات أخري.",
        },
    ],
    termsOfUses: {
        title_en: "Terms of uses",
        title_ar: "",
        content_en: "",
        content_ar: "",
    },
    policyAndPrivacy: {
        title_en: "Policy and privacy",
        title_ar: "",
        content_en: "",
        content_ar: "",
    },
};
async function GetDashboard(req, res, next) {
    try {
        const { userType, user_id } = (0, lodash_1.pick)(req.local, ["userType", "user_id"]);
        let result;
        if (userType === "vendor") {
            result = await GetVendorSummary(user_id, userType);
        }
        else {
            result = await GetAdminSummary();
        }
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
exports.GetDashboard = GetDashboard;
async function GetVendorSummary(user_id, userType) {
    return new Promise(async (resolve, reject) => {
        const today = (0, moment_1.default)().startOf("day").toDate();
        const [products, recent_orders, orders, total_products] = await Promise.all([
            product_model_1.Product.find({
                merchant: user_id,
                createdAt: {
                    $gte: today,
                },
            }).select("name images price main_price items"),
            order_model_1.Order.find({
                ...(userType === "vendor" ? { merchant: user_id } : {}),
                createdAt: {
                    $gte: today,
                },
            }).select("amounts status createdAt order_id items meta"),
            order_model_1.Order.find({
                ...(userType === "vendor" ? { merchant: user_id } : {}),
            }).select("amounts status createdAt order_id items meta"),
            product_model_1.Product.countDocuments({
                merchant: user_id,
            }),
        ]);
        const incompleteOrders = orders?.filter((order) => order.status !== "created");
        const createdOrders = orders?.filter((order) => order.status === "created");
        const completedOrders = orders?.filter((order) => order.status === "completed");
        const total_earnings = await (0, features_1.CollectEarnings)(completedOrders, userType);
        const suspended_earnings = await (0, features_1.CollectEarnings)(incompleteOrders, userType);
        const unpaid_amount = await (0, features_1.UnpaidPrices)(createdOrders);
        const unpaid_amount_from_vat = (0, features_1.CollectVATPrice)(unpaid_amount) + createdOrders?.length * 24;
        const result = {
            products,
            orders: recent_orders,
            date: today,
            summary: {
                suspended_earnings,
                total_earnings,
                unpaid_amount: unpaid_amount_from_vat,
                total_products,
            },
        };
        resolve(result);
    });
}
async function GetAdminSummary() {
    return new Promise(async (resolve, reject) => {
        let result, total_transactions = 0;
        const today = (0, moment_1.default)().startOf("day").toDate();
        const [total_vendors, available_subscriptions, expired_subscriptions, secure_vendors, transactions, products, total_products,] = await Promise.all([
            user_model_1.User.countDocuments({ userType: "vendor" }),
            subscription_model_1.Subscription.countDocuments(),
            subscription_model_1.Subscription.countDocuments({
                expiry_date: {
                    $lt: new Date(),
                },
            }),
            user_model_1.User.countDocuments({
                pt_customer_id: { $ne: null },
                userType: "vendor",
            }),
            transaction_model_1.Transaction.find({
                plan: {
                    $ne: null,
                },
            }).populate("plan"),
            product_model_1.Product.find({
                createdAt: {
                    $gte: today,
                },
            }).select("name images price main_price items"),
            product_model_1.Product.countDocuments(),
        ]);
        await Promise.all(transactions.map((e) => {
            const item = e.toJSON();
            total_transactions += Number(item.plan.price) || 0;
        }));
        result = {
            products,
            summary: {
                total_vendors,
                available_subscriptions,
                expired_subscriptions,
                secure_vendors,
                total_transactions: parseFloat(total_transactions.toFixed(2)),
                total_products,
            },
        };
        resolve(result);
    });
}
async function GetServerKeys(req, res, next) {
    try {
        const settings = await settings_model_1.Setting.find();
        res.json({ settings });
    }
    catch (error) {
        next(error);
    }
}
exports.GetServerKeys = GetServerKeys;
async function UpdateServerKeys(req, res, next) {
    try {
        const { settings: data } = (0, lodash_1.pick)(req.body, ["settings"]);
        const settings = await Promise.all(data.map(({ id, ...other }) => settings_model_1.Setting.findByIdAndUpdate(id, { $set: other }, { new: true })));
        res.json({ message: "Settings updated successfully!" });
    }
    catch (error) {
        next(error);
    }
}
exports.UpdateServerKeys = UpdateServerKeys;
async function GetStaticSettings(req, res, next) {
    try {
        const filename = "index.json";
        const filepath = path_1.default.join(__dirname, "../..", "static");
        const isExisted = fs_1.default.existsSync(filepath);
        if (!isExisted) {
            fs_1.default.mkdirSync(filepath, { recursive: true });
            fs_1.default.writeFileSync(path_1.default.join(filepath, filename), JSON.stringify(settingsData, null, 2));
        }
        const file = fs_1.default.readFileSync(path_1.default.join(filepath, filename), {
            encoding: "utf-8",
        });
        res.json({ settings: JSON.parse(file) });
    }
    catch (error) {
        next(error);
    }
}
exports.GetStaticSettings = GetStaticSettings;
const urlToken = (req, res) => {
    const redirect_uri = process.env.LOCAL_HTTP_WEBSOCKET;
    const Ali_Key = process.env.ALI_APP_KEY;
    res.json({ url: `https://api-sg.aliexpress.com/oauth/authorize?response_type=code&&force_auth=true&redirect_uri=${redirect_uri}&client_id=${Ali_Key}` });
};
exports.urlToken = urlToken;
