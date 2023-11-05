"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectShippingFee = exports.CollectVATPrice = exports.GetItems = exports.UnpaidPrices = exports.CollectEarnings = void 0;
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const { TAB_TAX, TAB_ORDERS_TAX, SHIPPING_FEE } = process.env;
async function CollectEarnings(data, userType) {
    return new Promise(async (resolve, reject) => {
        let result = 0;
        const collectItems = await GetItems(data);
        await Promise.all(collectItems?.map(async (item) => {
            const quantity = item.quantity || 1;
            const { vendor_price } = item.meta;
            result += vendor_price * quantity;
        })).catch((err) => reject(new ApiError_1.default("InternalServerError", err)));
        resolve(result);
    });
}
exports.CollectEarnings = CollectEarnings;
async function UnpaidPrices(data) {
    return new Promise(async (resolve, reject) => {
        let result = 0;
        const collectItems = await GetItems(data);
        await Promise.all(collectItems?.map((item) => {
            const quantity = item?.quantity;
            const productVendorPrice = Number(item?.meta?.vendor_price || 0) * quantity;
            const productPrice = Number(item?.product?.price || 0);
            const amount = parseFloat((productPrice - productVendorPrice).toFixed(2));
            result += amount;
        })).catch((err) => reject(new ApiError_1.default("InternalServerError", err)));
        resolve(parseFloat(result?.toFixed(2)));
    });
}
exports.UnpaidPrices = UnpaidPrices;
async function GetItems(data) {
    return new Promise(async (resolve, reject) => {
        const collectOrderItems = data?.map((_order) => {
            const order = _order.toJSON();
            const meta = order.meta || {};
            const items = order.items || [];
            return items?.map((item) => {
                const product = item.product;
                const vendorProductDetails = meta[product?.salla_product_id];
                if (vendorProductDetails) {
                    return {
                        ...item,
                        meta: vendorProductDetails,
                    };
                }
                return item;
            });
        });
        const collectItems = await Promise.all(new Array().concat(...collectOrderItems)).catch((err) => reject(new ApiError_1.default("InternalServerError", err)));
        resolve(collectItems);
    });
}
exports.GetItems = GetItems;
function CollectVATPrice(amount) {
    // Get the VAT percentage from the environment variable TAB_ORDERS_TAX
    const VAT = Number(TAB_ORDERS_TAX || 0);
    // Calculate the VAT amount by multiplying the amount by the VAT percentage
    const VATPercentage = VAT / 100;
    const VATAmount = parseFloat((amount * VATPercentage).toFixed(2));
    // Calculate the total price by adding the VAT amount to the original amount
    const total = parseFloat((amount + VATAmount).toFixed(2));
    return total;
}
exports.CollectVATPrice = CollectVATPrice;
function CollectShippingFee(amount) {
    // Get the SHIPPING_FEE from the environment variable SHIPPING_FEE
    const SHIPPING_AMOUNT = Number(SHIPPING_FEE || 24);
    // Calculate the Shipping amount by adding the amount by the SHIPPING_FEE
    return parseFloat((amount + SHIPPING_AMOUNT).toFixed(2));
}
exports.CollectShippingFee = CollectShippingFee;
