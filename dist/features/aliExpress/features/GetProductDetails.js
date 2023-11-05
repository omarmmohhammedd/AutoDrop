"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductId = exports.GetDetails = void 0;
const product_model_1 = require("../../../models/product.model");
const lodash_1 = require("lodash");
const path_1 = require("path");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const request_1 = __importDefault(require("../request"));
const slugify_1 = __importDefault(require("slugify"));
const uuid_1 = require("uuid");
const { ALI_APP_KEY, ALI_SECRET, ALI_BASE, ALI_TOKEN, ALI_REFRESH } = process.env;
class AEProduct {
    /**
     *
     * @param {product_id} - AliExpress product id to get details
     * @returns
     */
    async GetDetails({ product_id }) {
        return new Promise((resolve, reject) => {
            (0, request_1.default)({
                ship_to_country: "SA",
                product_id: product_id,
                target_currency: "SAR",
                target_language: "AR",
                method: "aliexpress.ds.product.get",
                sign_method: "sha256",
            })
                .then(async (response) => {
                const aeResponse = response?.data;
                const result = aeResponse?.aliexpress_ds_product_get_response?.result;
                const errorMessage = aeResponse?.error_response?.msg ||
                    "There is something went wrong while getting product details or maybe this product is not available to shipping to SA, try another product or contact support.";
                if (!result)
                    return reject(new ApiError_1.default("InternalServerError", errorMessage));
                const { ae_item_sku_info_dtos, ae_item_base_info_dto, ae_multimedia_info_dto, } = (0, lodash_1.pick)(result, [
                    "ae_item_sku_info_dtos",
                    "ae_item_base_info_dto",
                    "ae_multimedia_info_dto",
                ]);
                const { subject, product_id, detail } = ae_item_base_info_dto || {};
                const { ae_item_sku_info_d_t_o: SKUs } = ae_item_sku_info_dtos || {};
                const [{ price, quantities, options }, images] = await Promise.all([
                    AEProduct.prototype.GetProductOptions(SKUs || []),
                    AEProduct.prototype.GetProductImages(ae_multimedia_info_dto?.image_urls),
                ]);
                const values = new Array().concat(...options?.map((e) => e.values));
                const hasValues = values.length;
                // if (!hasValues)
                //   return reject(
                //     new ApiError("InternalServerError", "Try another product")
                //   );
                const data = {
                    name: subject,
                    description: detail,
                    price: price,
                    main_price: price,
                    quantity: quantities,
                    sku: (0, uuid_1.v4)(),
                    images: images
                        ?.slice(0, 10)
                        ?.map((img, index) => ({
                        ...img,
                        default: index === 0,
                    })),
                    options: options,
                    metadata_title: subject,
                    metadata_description: subject,
                    product_type: "product",
                    original_product_id: product_id,
                    merchant: "",
                    salla_product_id: "",
                    vendor_commission: undefined,
                    vendor_price: undefined,
                    require_shipping: true,
                    shipping: undefined,
                };
                const product = new product_model_1.Product(data).toJSON();
                // resolve({ ...product, result });
                resolve(product);
            })
                .catch((error) => {
                const err = error?.response?.data;
                reject(new ApiError_1.default("InternalServerError", err));
            });
        });
    }
    async GetProductOptions(SKUs) {
        let quantities = 0, price = 0, options = [], concatValues = [], collectOptions = [], collectValues = [];
        collectValues = SKUs.map((sku) => {
            return sku?.ae_sku_property_dtos?.ae_sku_property_d_t_o?.map((ev) => {
                const { sku_image, sku_price, sku_stock, sku_code, sku_available_stock, offer_sale_price, id } = sku;
                const quantity = sku_available_stock > 100 ? 100 : sku_available_stock;
                quantities += parseFloat(quantity || 0);
                return {
                    ...ev,
                    sku_image,
                    sku_price,
                    sku_stock,
                    sku_code,
                    quantity,
                    id,
                    offer_sale_price,
                };
            });
        });
        concatValues = await Promise.all(new Array().concat(...collectValues));
        collectOptions = (0, lodash_1.uniq)((0, lodash_1.map)(concatValues, "sku_property_name"));
        let sku_image_1;
        options = await Promise.all(collectOptions
            .map((option, index) => {
            const uniqValues = (0, lodash_1.uniqBy)(concatValues
                ?.filter((val) => val?.sku_property_name === option && val?.sku_stock)
                .map((e) => ({
                ...e,
                property_value_definition_name: e?.property_value_definition_name || e?.sku_property_value,
            })), "property_value_definition_name");
            const values = uniqValues?.map((val, idx) => {
                const isFirst = index == 0 && idx == 0;
                const { sku_image, property_value_definition_name, quantity, property_value_id, sku_property_id, id, sku_price, offer_sale_price, } = val;
                const valuePrice = parseFloat(sku_price);
                const offerPrice = parseFloat(offer_sale_price);
                const valPrice = valuePrice === offerPrice ? valuePrice : offerPrice;
                const displayValue = (0, slugify_1.default)(property_value_definition_name, {
                    lower: true,
                });
                sku_image_1 = sku_image;
                if (isFirst) {
                    price = valPrice;
                }
                return {
                    name: property_value_definition_name,
                    price: valPrice,
                    original_price: valPrice,
                    quantity: quantity,
                    is_default: isFirst,
                    property_id: property_value_id,
                    sku_id: sku_property_id,
                    display_value: displayValue,
                    sku: [sku_property_id, property_value_id].join(":"),
                    id
                };
            });
            return {
                name: option,
                display_type: sku_image_1 ? "image" : "text",
                values,
            };
        })
            .filter((e) => e.name !== "Ships From"));
        return { price, quantities, options };
    }
    async GetProductImages(URLs) {
        // const splitImages = ae_multimedia_info_dto?.image_urls?.split(";");
        const splitImages = URLs?.split(";");
        const images = splitImages?.map((obj, index) => ({
            original: obj,
            thumbnail: obj,
            alt: "image " + index,
            default: false,
        }));
        return images;
    }
    /**
     *
     * @param url aliexpress product URL
     * @returns product ID from URL
     */
    GetProductId(url) {
        const { pathname } = new URL(url);
        const filename = (0, path_1.basename)(pathname);
        const product_id = filename.replace((0, path_1.extname)(filename), "");
        return product_id;
    }
}
exports.default = AEProduct;
_a = new AEProduct(), exports.GetDetails = _a.GetDetails, exports.GetProductId = _a.GetProductId;
