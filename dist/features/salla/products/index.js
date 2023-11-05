"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const uuid_1 = require("uuid");
const generateRandomNumber_1 = __importDefault(require("../../generateRandomNumber"));
const request_1 = __importDefault(require("../request"));
class SallaProductHTTP {
    CreateProductOptions(product_id, data, token) {
        return (0, request_1.default)({
            url: "products/" + product_id + "/options",
            method: "post",
            data,
            token,
        });
    }
    GetProductVariants(product_id, token) {
        return new Promise((resolve, reject) => {
            (0, request_1.default)({
                url: "products/" + product_id + "/variants",
                method: "get",
                token,
            })
                .then(({ data }) => resolve(data))
                .catch((error) => reject(error?.response?.data));
        });
    }
    UpdateProductVariant(variant_id, data, token) {
        return (0, request_1.default)({
            url: "products/variants/" + variant_id,
            method: "put",
            data,
            token,
        });
    }
    DeleteProduct(id, token) {
        return (0, request_1.default)({
            url: "products/" + id,
            method: "delete",
            token,
        });
    }
    PushProduct(data, token) {
        return (0, request_1.default)({
            url: "products",
            method: "post",
            token,
            data,
        });
    }
}
class SallaProducts extends SallaProductHTTP {
    async createProduct(product, token) {
        return new Promise(async (resolve, reject) => {
            const sku = (0, uuid_1.v4)();
            const rest = (0, lodash_1.pick)(product, [
                "name",
                "metadata_title",
                "metadata_description",
                "options",
                "price",
                "images",
                "quantity",
                "description",
            ]);
            await super
                .PushProduct({
                sku,
                ...rest,
                product_type: "product",
            }, token)
                .then(({ data }) => resolve(data))
                .catch((error) => reject(error?.response?.data));
        });
    }
    async updateVariant(id, variant, token) {
        return new Promise(async (resolve, reject) => {
            const sku = (0, uuid_1.v4)();
            const mpn = (0, generateRandomNumber_1.default)().toString().substring(0, 8);
            const gtin = (0, generateRandomNumber_1.default)().toString().substring(0, 8);
            const barcode = [mpn, gtin].join("");
            variant = {
                ...variant,
                mpn,
                gtin,
                sku,
                barcode,
            };
            super
                .UpdateProductVariant(id, variant, token)
                .then(({ data }) => {
                resolve(data);
            })
                .catch((error) => reject(error?.response?.data));
        });
    }
}
exports.default = SallaProducts;
