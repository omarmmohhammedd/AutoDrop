"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrderStatus = exports.CreateNewOrder = void 0;
const lodash_1 = require("lodash");
const order_model_1 = require("../../../models/order.model");
const product_model_1 = require("../../../models/product.model");
const settings_1 = __importDefault(require("../../settings"));
const request_1 = __importDefault(require("../request"));
async function CreateNewOrder(body, res, next) {
    try {
        let total = 0, sub_total = 0, commission = 0;
        // const { APP_COMMISSION } = process.env;
        const APP_COMMISSION = await (0, settings_1.default)("APP_COMMISSION");
        const { data } = (0, lodash_1.pick)(body, ["data"]);
        const itemIds = (0, lodash_1.map)(data.items, "product.id");
        const products = await product_model_1.Product.find({
            store_product_id: {
                $in: itemIds,
            },
        }).exec();
        if (!products?.length)
            return;
        const findProductIds = (0, lodash_1.map)(products, "store_product_id");
        const filterItems = data.items?.filter((obj) => {
            return findProductIds.includes(obj?.product?.id?.toString());
        });
        for (const item of filterItems) {
            sub_total += parseFloat(item?.amounts?.total?.amount) || 0;
        }
        commission = Math.ceil((+sub_total * +APP_COMMISSION) / 100);
        total = +sub_total + commission;
        const order = new order_model_1.Order({
            ...data,
            amounts: {
                total: {
                    amount: total,
                },
                app_commission: {
                    amount: commission,
                    percentage: (0, lodash_1.parseInt)(APP_COMMISSION, 10) || 0,
                },
            },
            merchant: products?.[0]?.merchant,
            order_id: data.id,
            items: filterItems,
            status: "created",
        });
        order.save(function (err, result) {
            if (err)
                return console.log(err);
            console.log(result);
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}
exports.CreateNewOrder = CreateNewOrder;
async function UpdateOrderStatus(status, order_id, token) {
    const URL = "orders/" + order_id + "/status";
    return (0, request_1.default)({
        url: URL,
        method: "post",
        data: { slug: status },
        token,
    });
}
exports.UpdateOrderStatus = UpdateOrderStatus;
