"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductShipping = exports.GetProductDetails = void 0;
const lodash_1 = require("lodash");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const GetProductDetails_1 = require("../../../features/aliExpress/features/GetProductDetails");
const request_1 = __importDefault(require("../../../features/aliExpress/request"));
const baseApi_1 = __importDefault(require("../../../features/baseApi"));
const product_model_1 = require("../../../models/product.model");
const subscription_1 = require("../../subscription");
class AliExpressProducts extends baseApi_1.default {
    async GetProductDetails(req, res, next) {
        try {
            // console.log(ALI_APP_KEY, ALI_SECRET);
            const { user_id, userType } = (0, lodash_1.pick)(req.local, ["user_id", "userType"]);
            const { url } = (0, lodash_1.pick)(req.body, ["url"]);
            let product;
            const product_id = (0, GetProductDetails_1.GetProductId)(url);
            if (userType === "vendor")
                await (0, subscription_1.CheckSubscription)(user_id, "products_limit");
            product = await product_model_1.Product.findOne({ original_product_id: product_id })
                .populate([{ path: "options" }])
                .exec();
            if (!product) {
                product = await (0, GetProductDetails_1.GetDetails)({ product_id });
            }
            super.send(res, { product });
        }
        catch (error) {
            next(error);
        }
    }
    async GetProductShipping(req, res, next) {
        const { product_id, product_num } = (0, lodash_1.pick)(req.body, [
            "product_id",
            "product_num",
        ]);
        const method = "aliexpress.logistics.buyer.freight.calculate";
        const data = {
            method,
            param_aeop_freight_calculate_for_buyer_d_t_o: JSON.stringify({
                // sku_id,
                country_code: "SA",
                product_id,
                product_num,
                // province_code: "CN",
                send_goods_country_code: "CN",
                price_currency: "SAR",
            }),
            sign_method: "sha256",
        };
        (0, request_1.default)(data).then(({ data }) => {
            const error = data.error_response;
            const result = data?.aliexpress_logistics_buyer_freight_calculate_response?.result
                ?.aeop_freight_calculate_result_for_buyer_d_t_o_list
                ?.aeop_freight_calculate_result_for_buyer_dto;
            if (error)
                return next(new ApiError_1.default("UnprocessableEntity", error.msg));
            super.send(res, result);
        });
    }
}
_a = new AliExpressProducts(), exports.GetProductDetails = _a.GetProductDetails, exports.GetProductShipping = _a.GetProductShipping;
