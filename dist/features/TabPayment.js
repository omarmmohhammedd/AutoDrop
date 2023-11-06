"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const settings_1 = __importDefault(require("./settings"));
dotenv_1.default.config();
const { TAB_KEY, TAB_BASE } = process.env;
class TabPayment {
    currency;
    constructor() {
        this.currency = "SAR";
    }
    async CreateRequest({ method, pathname, body, }) {
        const TAB_TOKEN = await (0, settings_1.default)('TAB_TOKEN');
        return (0, axios_1.default)({
            url: TAB_BASE + pathname,
            method: method,
            data: body,
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                Authorization: "Bearer " + TAB_TOKEN,
            },
        });
    }
    CreateInvoice(body) {
        const { currencies, order, post, redirect, ref_invoice, ref_order, customer, ...data } = body;
        const payload = {
            ...data,
            currencies: [this.currency],
            order: {
                ...order,
                currency: this.currency,
                items: order.items?.map((e) => ({ ...e, currency: this.currency })),
                id: order.id
            },
            ...(post && {
                post: {
                    url: post,
                },
            }),
            ...(redirect && {
                redirect: {
                    url: redirect,
                },
            }),
            reference: {
                invoice: ref_invoice,
                order: ref_order,
            },
            customer: {
                // email: "frontdev0219@gmail.com",
                // first_name: "test",
                // last_name: "test",
                // middle_name: "test",
                id: customer,
            },
            charge: {
                receipt: {
                    email: true,
                    sms: true,
                },
            },
            payment_methods: ["MADA", "VISA"],
        };
        return this.CreateRequest({
            pathname: "invoices",
            method: "post",
            body: payload,
        });
    }
    GetChargeDetails(id) {
        return this.CreateRequest({
            pathname: "charges/" + id,
            method: "get",
            body: undefined,
        });
    }
    GetInvoiceDetails(id) {
        return this.CreateRequest({
            pathname: "invoices/" + id,
            method: "get",
            body: undefined,
        });
    }
    CreateCustomer(body) {
        return this.CreateRequest({
            pathname: "customers",
            method: "post",
            body: JSON.stringify({ ...body, currency: this.currency }),
        });
    }
    // *****Start CreateCharge ******
    CreateCharge(body) {
        const { currency, post, redirect, ref_order, order, customer, amount, // *important --> The amount charge
        ...data } = body;
        const payload = {
            ...data,
            currency: this.currency,
            amount: order.amount,
            order: {
                ...order,
                currency: this.currency,
                items: [], // No need for items in charge
            },
            ...(post && {
                post: {
                    url: post, //https://689e-197-252-211-103.ngrok-free.app/api/v1/payments/callback/subscriptions
                },
            }),
            ...(redirect && {
                redirect: {
                    url: redirect,
                },
            }),
            reference: {
                order: ref_order,
            },
            customer,
            charge: {
                receipt: {
                    email: true,
                    sms: true,
                },
            },
            source: {
                id: "src_all",
            },
            // payment_method: []
        };
        return this.CreateRequest({
            pathname: "charges",
            method: "post",
            body: payload,
        });
        // *****End CreateCharge ******
    }
}
exports.default = TabPayment;
