"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayTabPayment = void 0;
const dotenv_1 = require("dotenv");
const axios_1 = __importDefault(require("axios"));
(0, dotenv_1.config)();
const { PT_PROFILE_ID, PT_MERCHANT_ID, PT_SERVER_KEY, PT_BASE, PT_CURRENCY, LOCAL_HTTP_WEBSOCKET, } = process.env;
class PayTabPayment {
    CreatePaymentPage(id, amount, customer, pathname, description) {
        return (0, axios_1.default)({
            url: PT_BASE + "payment/request",
            method: "post",
            headers: {
                Authorization: PT_SERVER_KEY,
            },
            data: {
                profile_id: PT_PROFILE_ID,
                tran_type: "sale",
                tran_class: "ecom",
                cart_id: id,
                cart_currency: PT_CURRENCY,
                cart_amount: amount,
                cart_description: description,
                paypage_lang: "en",
                customer_details: customer,
                return: LOCAL_HTTP_WEBSOCKET + pathname,
                payment_methods: ["mada", "applepay", "visa", "creditcard", "stcpay"],
            },
        });
    }
    CreateTransaction(type, id, tranRef, amount, 
    // return_url: string,
    description) {
        return (0, axios_1.default)({
            url: PT_BASE + "payment/request",
            method: "post",
            headers: {
                Authorization: PT_SERVER_KEY,
            },
            data: {
                profile_id: PT_PROFILE_ID,
                tran_ref: tranRef,
                cart_id: id,
                tran_type: type,
                tran_class: "ecom",
                cart_currency: PT_CURRENCY,
                cart_amount: amount,
                cart_description: description,
            },
        });
    }
    GetPaymentDetails(tranRef) {
        return (0, axios_1.default)({
            url: PT_BASE + "payment/query",
            method: "post",
            headers: {
                Authorization: PT_SERVER_KEY,
            },
            data: {
                profile_id: PT_PROFILE_ID,
                tran_ref: tranRef,
            },
        });
    }
}
exports.PayTabPayment = PayTabPayment;
