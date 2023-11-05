"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = require("node-cron");
const GetProductDetails_1 = __importDefault(require("../../../features/aliExpress/features/GetProductDetails"));
const product_model_1 = require("../../../models/product.model");
const time = "0 */12 * * *";
// const time: string = "* 1 * * *";
const { GetDetails } = new GetProductDetails_1.default();
const task = (0, node_cron_1.schedule)(time, async function () {
    try {
        console.log("cron job started to update products when original product price updated");
        const products = await product_model_1.Product.find().exec();
        if (!products && !products.length)
            return;
        await Promise.all(products.map(async (product) => {
            const findProduct = await GetDetails({
                product_id: product.original_product_id,
            });
            if (!findProduct)
                return;
            if (product.main_price !== findProduct.main_price) {
                product.main_price = findProduct.main_price;
                product.price = findProduct.main_price + product.vendor_price;
                return product.save();
            }
        }));
    }
    catch (error) {
        console.log("Error while getting products details and update..");
        console.log(error);
    }
});
exports.default = task;
