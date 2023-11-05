"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceOrder = void 0;
// import { stringify } from "javascript-stringify";
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const request_1 = __importDefault(require("../request"));
const errors = {
    B_DROPSHIPPER_DELIVERY_ADDRESS_VALIDATE_FAIL: "Address is invalid",
    BLACKLIST_BUYER_IN_LIST: "The buyer in blacklist so cannot place any order",
    USER_ACCOUNT_DISABLED: "User account disabled",
    PRICE_PAY_CURRENCY_ERROR: "Currency is not acceptable",
    DELIVERY_METHOD_NOT_EXIST: "Shipping service is invalid",
    INVENTORY_HOLD_ERROR: "Inventory hold!",
    REPEATED_ORDER_ERROR: "There is another order with the same data in progress",
    ERROR_WHEN_BUILD_FOR_PLACE_ORDER: "There is something went wrong while placing new order, try again later or contact out support",
    A001_ORDER_CANNOT_BE_PLACED: "Orders",
    A002_INVALID_ZONE: "A002_INVALID_ZONE",
    A003_SUSPICIOUS_BUYER: "A003_SUSPICIOUS_BUYER",
    A004_CANNOT_USER_COUPON: "Invalid coupon",
    A005_INVALID_COUNTRIES: "Invalid country",
    A006_INVALID_ACCOUNT_INFO: "Invalid account info",
};
async function PlaceOrder(order) {
    return new Promise(async (resolve, reject) => {
        const { items, customer_address, customer } = order;
        const product_items = await getProductItems(items, order);
        const logistics_address = getLogisticsAddress(customer_address, customer);
        const out_order_id = order.id;
        const params = { product_items, logistics_address, out_order_id };
        const body = {
            param_place_order_request4_open_api_d_t_o: JSON.stringify(params, null, ""),
            method: "aliexpress.trade.buy.placeorder",
        };
        (0, request_1.default)(body).then(async ({ data }) => {
            const result = data?.aliexpress_trade_buy_placeorder_response?.result;
            const orderList = result?.order_list?.number || [];
            const error = data?.error_response;
            const message = error?.msg ||
                "Something went wrong while placing new order, try again later";
            console.log(result);
            if (error)
                return reject(new ApiError_1.default("InternalServerError", message));
            if (!result.is_success)
                return reject(new ApiError_1.default("UnprocessableEntity", errors[result.error_code]));
            order.tracking_order_id = JSON.stringify(orderList, null, "");
            await order?.save();
            resolve({
                list: orderList,
            });
        });
    });
}
exports.PlaceOrder = PlaceOrder;
async function getProductItems(items, order) {
    return await Promise.all(items.map(async (item) => {
        const { product, options } = item;
        const shippingMethod = order.products_shipping_services.find((shipping) => shipping.product_id == product._id);
        const sku_attr = options
            .map((option) => option.value?.sku)
            .join("#");
        return {
            product_id: product?.original_product_id,
            product_count: item.quantity,
            sku_attr,
            logistics_service_name: shippingMethod?.service_name,
            order_memo: "Hello , We are using dropshipping in our store, Please don't put ali express logo on the product.",
        };
    }));
}
function getLogisticsAddress(address, customer) {
    return {
        country: address.country_code,
        zip: address.postal_code,
        address: address.shipping_address,
        address2: address.shipping_address,
        contact_person: `${customer.first_name} ${customer.last_name}`,
        mobile_no: `${customer.mobile}`,
        locale: "ar_SA",
        full_name: `${customer.first_name} ${customer.last_name}`,
        is_foreigner: "false",
        phone_country: customer.mobile_code,
    };
}
