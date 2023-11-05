"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformPrice = exports.getShippingAmount = exports.CollectShippingFee = exports.CollectVATPrice = exports.GetItems = exports.UnpaidPrices = exports.CollectEarnings = void 0;
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const { TAB_TAX, TAB_ORDERS_TAX, SHIPPING_FEE } = process.env;
async function CollectEarnings(data) {
    return new Promise(async (resolve, reject) => {
        let result = 0;
        const collectItems = await GetItems(data);
        await Promise.all(collectItems?.map(async (item) => {
            const quantity = item.quantity || 1;
            const { price, main_price, vendor_commission } = item.meta;
            const platform_price = PlatformPrice(main_price) * quantity;
            const vendor_price = (price - main_price) * quantity;
            // const vendor_price = price - main_price;
            // result += vendor_price * quantity;
            result += vendor_price - platform_price;
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
            const productVendorPrice = Number(item?.meta?.main_price || 0) * quantity;
            result += CollectVATPrice(productVendorPrice);
        })).catch((err) => reject(new ApiError_1.default("InternalServerError", err)));
        resolve(parseFloat(result?.toFixed(2)));
    });
}
exports.UnpaidPrices = UnpaidPrices;
async function GetItems(data) {
    return new Promise(async (resolve, reject) => {
        const collectOrderItems = data?.map((_order) => {
            let price = 0, main_price = 0, vendor_commission = 0;
            const order = _order.toJSON();
            const meta = order.meta || {};
            const items = order.items || [];
            return items?.map((item) => {
                const product = item.product;
                const vendorProductDetails = meta[product?.store_product_id];
                const productValues = Object.values(vendorProductDetails);
                const filterProductValues = productValues.filter((e) => e instanceof Object);
                if (filterProductValues.length) {
                    filterProductValues.forEach((value) => {
                        price += value?.price || 0;
                        main_price += value?.main_price || 0;
                        vendor_commission = value?.vendor_commission || 0;
                    });
                    return {
                        ...item,
                        meta: {
                            price,
                            main_price,
                            vendor_commission,
                        },
                    };
                }
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
function getShippingAmount(shipping) {
    let total = 0;
    shipping.forEach((item) => {
        total += Number(item.amount || 0);
    });
    return parseFloat(total.toFixed(2));
}
exports.getShippingAmount = getShippingAmount;
function PlatformPrice(amount) {
    const VAT = Number(TAB_ORDERS_TAX || 0);
    const VATPercentage = VAT / 100;
    const VATAmount = parseFloat((amount * VATPercentage).toFixed(2));
    // Calculate the total price by adding the VAT  to the original amount
    const total = parseFloat(VATAmount.toFixed(2));
    return total;
}
exports.PlatformPrice = PlatformPrice;
