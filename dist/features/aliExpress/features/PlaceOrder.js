"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceOrder = void 0;
const order_model_1 = require("../../../models/order.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const product_model_1 = require("../../../models/product.model");
const request_1 = __importDefault(require("../request"));
const { ALI_APP_KEY, ALI_SECRET, ALI_BASE } = process.env;
async function PlaceOrder(order) {
    return new Promise(async (resolve, reject) => {
        let logistics_address, product_items;
        const { items, shipping } = order.toJSON();
        const orderData = order.toJSON();
        product_items = await Promise.all(items
            ?.map(async (item) => {
            const product = await product_model_1.Product.findById(item?.product?._id).exec();
            if (!product)
                return;
            const { data: aliProduct } = await (0, request_1.default)({
                method: 'aliexpress.ds.product.get',
                product_id: product.original_product_id,
                sign_method: "sha256",
            });
            const sku_property_id = item?.sku.split(':')[0];
            const property_value_id = item?.sku.split(':')[1];
            const skuValue = [];
            aliProduct?.aliexpress_ds_product_get_response?.result?.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o.map((option) => {
                option.ae_sku_property_dtos.ae_sku_property_d_t_o.filter((value) => {
                    if (value.sku_property_id == sku_property_id && property_value_id == value.property_value_id) {
                        return skuValue.push(option);
                    }
                });
            });
            if (skuValue?.flat()[0]?.id) {
                return {
                    product_id: Number(product.original_product_id),
                    product_count: item?.quantity,
                    logistics_service_name: item?.product?.shipping?.serviceName,
                    sku_attr: `${skuValue?.flat()[0]?.id}`
                };
            }
        })
            .filter((e) => e));
        const full_name = `${orderData?.customer?.first_name} ${orderData?.customer?.middle_name} ${orderData?.customer?.last_name} `;
        const addresss = shipping?.address;
        logistics_address = {
            country: addresss?.country,
            city: addresss?.city_en,
            zip: addresss?.postal_code,
            address: `${addresss?.street_en} ${addresss?.district_en}`,
            locale: "ar_SA",
            phone_country: "+966",
            full_name,
            "is_foreigner": "false",
            mobile_no: orderData.customer?.mobile,
            contact_person: full_name,
            province: addresss?.province_en + " Province",
            order_memo: "Please Don't Put any logo on the products , We are using dropshipping service in our store"
        };
        const min = 100000000;
        const max = 999999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        const data = JSON.stringify({
            product_items,
            logistics_address,
            out_order_id: randomNumber
        });
        const method = "aliexpress.trade.buy.placeorder";
        const option = {
            method,
            param_place_order_request4_open_api_d_t_o: data,
            sign_method: "sha256",
        };
        (0, request_1.default)(option).then(async ({ data }) => {
            const error = data.error_response;
            if (error)
                return reject(new ApiError_1.default("UnprocessableEntity", error.msg));
            const result = data?.aliexpress_trade_buy_placeorder_response?.result?.order_list;
            if (result.number[0]) {
                await order_model_1.Order.findByIdAndUpdate(order.id, { $set: { 'tracking_order_id': result.number[0], 'paid': true, status: 'in_review' } }, { new: true }).then((e) => {
                    return resolve(result);
                });
            }
            else
                throw new ApiError_1.default('409', 'error occur in order data');
        });
    });
}
exports.PlaceOrder = PlaceOrder;
