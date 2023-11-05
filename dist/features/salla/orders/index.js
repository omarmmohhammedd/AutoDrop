"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCities = exports.UpdateSalaOrderStatus = exports.CreateNewOrder = void 0;
const product_model_1 = require("../../../models/product.model");
const order_model_1 = require("../../../models/order.model");
const lodash_1 = require("lodash");
const request_1 = __importDefault(require("../request"));
async function CreateNewOrder(body, res, next) {
    try {
        let total = 0, sub_total = 0, commission = 0;
        // const { APP_COMMISSION } = process.env;
        // const APP_COMMISSION = await findSettingKey("APP_COMMISSION");
        const { data } = (0, lodash_1.pick)(body, ["data"]);
        const itemIds = (0, lodash_1.map)(data.items, "product.id");
        const products = await product_model_1.Product.find({
            salla_product_id: {
                $in: itemIds,
            },
        }).exec();
        if (!products?.length)
            return;
        const findProductIds = (0, lodash_1.map)(products, "salla_product_id");
        const filterItems = data.items?.filter((obj) => {
            return findProductIds.includes(obj?.product?.id?.toString());
        });
        for (const item of filterItems) {
            sub_total += parseFloat(item?.amounts?.total?.amount) || 0;
        }
        total = +sub_total + commission;
        const order = new order_model_1.Order({
            ...data,
            amounts: {
                total: {
                    amount: total,
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
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}
exports.CreateNewOrder = CreateNewOrder;
async function UpdateSalaOrderStatus(status, order_id, token) {
    const URL = "orders/" + order_id + "/status";
    return (0, request_1.default)({
        url: URL,
        method: "post",
        data: { slug: status },
        token,
    });
}
exports.UpdateSalaOrderStatus = UpdateSalaOrderStatus;
const getCities = async (req, res) => {
    try {
        let counter = 15;
        let Cities = [];
        while (counter > 0) {
            let data = await (0, request_1.default)({
                url: 'https://api.salla.dev/admin/v2/countries/1473353380/cities',
                method: 'get',
                token: req.local.access_token,
                data: {
                    page: counter
                }
            });
            Cities.push(...data.data.data);
            counter -= 1;
        }
        res.json({ Cities });
    }
    catch (error) {
        console.log(error);
    }
};
exports.getCities = getCities;
