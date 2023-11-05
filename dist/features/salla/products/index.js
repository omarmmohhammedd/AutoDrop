"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
        return (0, request_1.default)({
            url: "products/" + product_id + "/variants",
            method: "get",
            token,
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
}
class SallaProducts extends SallaProductHTTP {
    async CreateProduct(data, token) {
        const { data: product } = await (0, request_1.default)({
            url: "products",
            method: "post",
            data,
            token,
        });
        const { id, urls, options } = product.data;
        console.log(product);
        const requestOptions = options;
        const originalOptions = data.options;
        const mapOptions = originalOptions.map((ev) => {
            const option = requestOptions.find((e) => e.name === ev.name);
            if (option) {
                const values = ev.values.map((val) => {
                    const value = option.values.find((v) => v.display_value === val.display_value);
                    if (value) {
                        return {
                            ...value,
                            salla_value_id: value.id,
                        };
                    }
                    return val;
                });
                return {
                    ...option,
                    values,
                    salla_option_id: option.id,
                };
            }
            return ev;
        });
        const PRODUCT_OPTIONS = await SallaProducts.prototype.GetAndCreateProductOptions(mapOptions, id, token);
        return { updatedOptions: PRODUCT_OPTIONS, id, urls };
    }
    async GetAndCreateProductOptions(options, id, token) {
        const mapOptions = await Promise.all(options.map(async (option) => {
            const { id: optionID, values } = option;
            console.log(id);
            const productValues = await SallaProducts.prototype.UpdateProductVariants(values, id, token);
            return {
                ...option,
                values: productValues,
            };
        }));
        console.log("options => \n");
        return mapOptions;
    }
    async UpdateProductVariants(values, id, token) {
        const { data } = await super.GetProductVariants(id, token);
        const variants = data.data;
        const mapValues = await Promise.all(values.map(async (value) => {
            const { salla_value_id, price, quantity } = value;
            const variant = variants.find((ev) => ev?.related_option_values?.includes(salla_value_id));
            const variantID = variant.id;
            const skuWithBarcode = ["vl", salla_value_id, variantID].join("-");
            const randomValue = salla_value_id?.toString()?.slice(0, 8);
            const body = {
                sku: skuWithBarcode,
                barcode: skuWithBarcode,
                price: price,
                sale_price: price,
                regular_price: price,
                stock_quantity: quantity,
                mpn: randomValue,
                gtin: randomValue,
            };
            const { data } = await super.UpdateProductVariant(variantID, body, token);
            return {
                ...value,
                salla_variant_id: variantID,
            };
        }));
        console.log("values => \n");
        // console.table(mapValues);
        return mapValues;
    }
}
exports.default = SallaProducts;
