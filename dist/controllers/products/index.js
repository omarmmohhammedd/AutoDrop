"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyConverterr = exports.DeleteProduct = exports.GetSelectedProduct = exports.GetAllProducts = exports.CreateProduct = exports.GetProductDetails = exports.getProductShippingDetails = void 0;
const lodash_1 = require("lodash");
const axios_1 = __importStar(require("axios"));
const events_1 = __importDefault(require("../../webhooks/salla/events"));
const CC = require('currency-converter-lt');
const product_model_1 = require("../../models/product.model");
const index_1 = __importDefault(require("../../features/salla/products/index"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const user_model_1 = require("../../models/user.model");
const subscription_1 = require("../subscription");
const mongoose_1 = require("mongoose");
const ModelsFactor_1 = __importDefault(require("../../features/ModelsFactor"));
const GetProductDetails_1 = __importDefault(require("../../features/aliExpress/features/GetProductDetails"));
const request_1 = __importDefault(require("../../features/aliExpress/request"));
const { GetDetails, GetProductId } = new GetProductDetails_1.default();
const { CreateProduct: CreateSallaProduct, DeleteProduct: DeleteSallaProduct } = new index_1.default();
const UpdateProductVariant = async (variantId, barcode, price, stock_quantity, mpn, gtin, sku, token) => {
    const options = {
        method: 'PUT',
        url: `https://api.salla.dev/admin/v2/products/variants/${variantId}`,
        params: {
            sku,
            barcode,
            price,
            stock_quantity
        },
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
        },
        data: {
            sku,
            barcode,
            price,
            stock_quantity,
            mpn,
            gtin
        }
    };
    try {
        const { data } = await axios_1.default.request(options);
        return data;
    }
    catch (error) {
    }
};
const { GetUserInfo } = new events_1.default();
async function getProductShippingDetails(req, res, next) {
    const product_id = Number(req.params.id);
    const product_num = Number(req.body.product_num);
    try {
        await (0, request_1.default)({
            method: 'aliexpress.logistics.buyer.freight.get',
            sign_method: "sha256",
            aeopFreightCalculateForBuyerDTO: JSON.stringify({
                sku_id: '123123123123123',
                country_code: 'SA',
                product_id,
                product_num,
                price_currency: "SAR"
            }),
        }).then(response => res.json({ productShipping: response?.data.aliexpress_logistics_buyer_freight_get_response?.result?.aeop_freight_calculate_result_for_buyer_dtolist }));
    }
    catch (error) {
        console.log(error.data);
    }
}
exports.getProductShippingDetails = getProductShippingDetails;
async function GetProductDetails(req, res, next) {
    try {
        const { user_id, userType } = (0, lodash_1.pick)(req.local, ["user_id", "userType"]);
        const { url } = (0, lodash_1.pick)(req.body, ["url"]);
        const product_id = GetProductId(url);
        if (userType === "vendor")
            await (0, subscription_1.CheckSubscription)(user_id, "products_limit");
        const product = await GetDetails({ product_id });
        res.json(product);
    }
    catch (error) {
        next(error);
    }
}
exports.GetProductDetails = GetProductDetails;
async function CreateProduct(req, res, next) {
    try {
        let token, account;
        let subscription;
        const { access_token, user_id, userType } = (0, lodash_1.pick)(req.local, [
            "user_id",
            "access_token",
            "userType",
        ]);
        const { merchant, vendor_commission, main_price, ...body } = (0, lodash_1.pick)(req.body, [
            "name",
            "description",
            "vendor_commission",
            "main_price",
            "price",
            "quantity",
            "sku",
            "images",
            "options",
            "metadata_title",
            "metadata_description",
            "product_type",
            "original_product_id",
            "merchant",
        ]);
        subscription = await (0, subscription_1.CheckSubscription)(userType === "vendor" ? user_id : merchant, "products_limit");
        const product = new product_model_1.Product({
            ...body,
            vendor_commission,
            main_price,
            merchant: userType === "vendor" ? user_id : merchant,
        });
        const vendor_price = parseFloat(((main_price * vendor_commission) / 100).toFixed(2));
        product.vendor_price = vendor_price;
        product.vendor_commission = vendor_commission;
        const options = body?.options?.map((option) => {
            const values = option.values;
            return {
                ...option,
                values: values?.map((value) => {
                    const valuePrice = value.original_price;
                    const vendorOptionPrice = parseFloat((valuePrice + (valuePrice * vendor_commission) / 100).toFixed(2));
                    return {
                        ...value,
                        original_price: valuePrice,
                        price: vendorOptionPrice,
                    };
                }),
            };
        });
        product.options = options;
        token = access_token;
        if (userType === "admin") {
            account = await user_model_1.User.findOne({
                _id: merchant,
                userType: "vendor",
            }).exec();
        }
        const options_1 = {
            method: "POST",
            url: "https://api.salla.dev/admin/v2/products",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            data: {
                name: product.name,
                price: product.price,
                product_type: product.product_type,
                quantity: product.quantity,
                description: product.description,
                cost_price: product.main_price,
                require_shipping: product.require_shipping,
                sku: product.sku + 10,
                images: product.images,
                options: product.options,
            },
        };
        const jsonProduct = product.toJSON();
        const valuesStock = new Array().concat(...jsonProduct.options.map((option) => option.values));
        if (valuesStock.length > 100)
            throw new ApiError_1.default("UnprocessableEntity", "Values count should be smaller than 100");
        const { data: productResult } = await axios_1.default.request(options_1);
        // update options
        product.options = await Promise.all(jsonProduct.options.map(async (option, index) => {
            let obj = option;
            const productOption = productResult.data.options[index];
            const values = await Promise.all(option.values.map((value, idx) => {
                const optionValue = productOption?.values?.[idx];
                const mnp = getRandomInt(100000000000000, 999999999999999);
                const gitin = getRandomInt(10000000000000, 99999999999999);
                return {
                    ...value,
                    mpn: mnp,
                    gtin: gitin,
                    salla_value_id: optionValue?.id,
                };
            }));
            obj.salla_option_id = productOption?.id;
            obj.values = values;
        }));
        const variants = {
            method: "GET",
            url: `https://api.salla.dev/admin/v2/products/${productResult.data.id}/variants`,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        };
        const { data: variantResult } = await axios_1.default.request(variants);
        const finalOptions = await Promise.all(jsonProduct.options.map(async (option) => {
            const values = await Promise.all(option.values.map(async (optionValue) => {
                const variants = variantResult.data || [];
                const variant = variants.find((item) => item.related_option_values?.includes(optionValue.salla_value_id));
                if (!variant)
                    return;
                const { price, quantity, mpn, gtin, sku, id } = optionValue;
                const barcode = [mpn, gtin].join("");
                const result = await UpdateProductVariant(variant.id, barcode, price, quantity, mpn, gtin, sku, token);
                return {
                    ...optionValue,
                    salla_variant_id: result?.data?.id,
                };
            }));
            return {
                ...option,
                values,
            };
        }));
        product.options = finalOptions;
        product.salla_product_id = productResult.data?.id;
        if (subscription.products_limit)
            subscription.products_limit = subscription.products_limit - 1;
        await Promise.all([product.save(), subscription.save()]);
        res.status(200).json({
            message: "Product created successfully",
            result: {
                urls: productResult.data.urls || {},
            },
        });
    }
    catch (error) {
        const isAxiosError = error instanceof axios_1.AxiosError;
        const values = error?.response?.data;
        next(isAxiosError ? new ApiError_1.default("UnprocessableEntity", values) : error);
    }
}
exports.CreateProduct = CreateProduct;
async function GetAllProducts(req, res, next) {
    try {
        const { user_id, userType } = (0, lodash_1.pick)(req.local, ["user_id", "userType"]);
        const { page, search_key, min_price, max_price, vendor } = (0, lodash_1.pick)(req.query, [
            "page",
            "search_key",
            "vendor",
            "min_price",
            "max_price",
        ]);
        const populate = [
            {
                path: "merchant",
                select: "name avatar email mobile",
            },
        ];
        const query = {
            ...(userType === "vendor" && { merchant: user_id }),
            ...(vendor && { merchant: vendor }),
            price: {
                $gte: parseFloat(min_price) || 0,
                ...(max_price && { $lte: parseFloat(max_price) || 0 }),
            },
        };
        const products = await (0, ModelsFactor_1.default)(product_model_1.Product, { page, search_key, populate }, query);
        res.json(products);
    }
    catch (error) {
        next(error);
    }
}
exports.GetAllProducts = GetAllProducts;
async function GetSelectedProduct(req, res, next) {
    try {
        const { id } = (0, lodash_1.pick)(req.params, ["id"]);
        if (!(0, mongoose_1.isValidObjectId)(id))
            throw new ApiError_1.default("UnprocessableEntity", "Invalid item");
        const product = await product_model_1.Product.findById(id).exec();
        if (!product)
            throw new ApiError_1.default("NotFound", "Selected item is not found.");
        res.json(product);
    }
    catch (error) {
        next(error);
    }
}
exports.GetSelectedProduct = GetSelectedProduct;
async function DeleteProduct(req, res, next) {
    try {
        let token, account;
        const { user_id, access_token, userType } = (0, lodash_1.pick)(req.local, [
            "user_id",
            "access_token",
            "userType",
        ]);
        const { id } = (0, lodash_1.pick)(req.body, ["id"]);
        const product = await product_model_1.Product.findOne({
            // merchant: user_id,
            _id: id,
        }).exec();
        if (!product)
            throw new ApiError_1.default("NotFound", "Product not found");
        token = access_token;
        if (userType === "admin") {
            account = await user_model_1.User.findOne({
                userType: "vendor",
                _id: product?.merchant,
            }).exec();
            if (!account)
                throw new ApiError_1.default("NotFound", "Account not found");
            token = JSON.parse(account?.tokens)?.access_token;
        }
        DeleteSallaProduct(product?.salla_product_id, token)
            .then(async ({ data }) => {
            await product.delete();
            res.json({
                message: data?.data?.message,
            });
        })
            .catch((error) => {
            return next(new ApiError_1.default("UnprocessableEntity", error.response?.data));
        });
    }
    catch (error) {
        next(error);
    }
}
exports.DeleteProduct = DeleteProduct;
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
async function currencyConverterr(req, res, next) {
    const { from, amount } = req.query;
    const converter = new CC({ from, to: 'SAR' });
    converter.convert(Number(amount)).then((price) => {
        if (price) {
            res.json({ price });
        }
        else {
            res.sendStatus(200);
        }
    });
}
exports.currencyConverterr = currencyConverterr;
