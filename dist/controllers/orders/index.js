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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCustomerDetails = exports.singleOrder = exports.UpdateCustomerAddress = exports.UpdateProductsShipping = exports.UpdateOrderStatus = exports.CreatePaymentToSubscribe = exports.DeleteOrder = exports.GetSelectedOrder = exports.GetAllOrders = exports.UpdateOrderTracking = void 0;
const lodash_1 = require("lodash");
const mongoose_1 = __importStar(require("mongoose"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const GenerateLocation_1 = __importDefault(require("../../features/GenerateLocation"));
const TabPayment_1 = __importDefault(require("../../features/TabPayment"));
const baseApi_1 = __importDefault(require("../../features/baseApi"));
const mongoPaginate_1 = require("../../features/mongoPaginate");
const payments_1 = require("../../features/payments");
const index_1 = require("../../features/salla/orders/index");
const authentication_1 = require("../../middlewares/authentication");
const access_model_1 = require("../../models/access.model");
const order_model_1 = require("../../models/order.model");
const user_model_1 = require("../../models/user.model");
const aggregation_1 = require("./features/aggregation");
const PTPayment = new payments_1.PayTabPayment();
const TPayment = new TabPayment_1.default();
const { PT_REFUND_FEES, PT_TRANS_FEES, LOCAL_HTTP_WEBSOCKET, TAB_TAX, TAB_ORDERS_TAX, } = process.env;
const shippingFee = parseFloat(process.env.SHIPPING_FEE || "24");
class OrdersController extends baseApi_1.default {
    async GetAllOrders(req, res, next) {
        try {
            const { user_id, userType } = (0, lodash_1.pick)(req.local, [
                "user_id",
                "merchant",
                "userType",
            ]);
            const { page = 1, search_key } = (0, lodash_1.pick)(req.query, ["page", "search_key"]);
            const pipelines = [
                {
                    $match: {
                        ...(search_key && {
                            $text: {
                                $search: search_key,
                            },
                        }),
                        userId: {
                            $eq: new mongoose_1.default.Types.ObjectId(user_id),
                        },
                    },
                },
                ...aggregation_1.ordersAggregation,
            ];
            const aggregate = order_model_1.Order.aggregate(pipelines);
            order_model_1.Order.aggregatePaginate(aggregate, {
                ...mongoPaginate_1.options,
                page,
            }, (error, orders) => {
                if (error) {
                    console.log(error);
                    return next(new ApiError_1.default("UnprocessableEntity", error.message));
                }
                super.send(res, { orders });
            });
        }
        catch (error) {
            next(error);
        }
    }
    async GetSelectedOrder(req, res, next) {
        try {
            const { user_id } = (0, lodash_1.pick)(req.local, ["user_id"]);
            const { id } = (0, lodash_1.pick)(req.params, ["id"]);
            if (!(0, mongoose_1.isValidObjectId)(id))
                throw new ApiError_1.default("UnprocessableEntity", "Invalid item");
            const order = await OrdersController.prototype.singleOrder(id);
            super.send(res, { order });
        }
        catch (error) {
            next(error);
        }
    }
    async DeleteOrder(req, res, next) {
        try {
            const { user_id } = (0, lodash_1.pick)(req.local, ["user_id"]);
            const { id } = (0, lodash_1.pick)(req.body, ["id"]);
            order_model_1.Order.findOneAndDelete({
                _id: id,
                merchant: user_id,
            }, {}, (err, result) => {
                if (err)
                    return next(new ApiError_1.default("InternalServerError", "Something went wrong while deleting selected order"));
                if (!result)
                    return next(new ApiError_1.default("NotFound", "Item not found"));
                super.send(res, "Selected order deleted successfully");
            });
        }
        catch (error) {
            next(error);
        }
    }
    async CreatePaymentToSubscribe(req, res, next) {
        try {
            const location = (0, GenerateLocation_1.default)(req);
            const route = "/v1/payments/callback/pay-order";
            const { id, notes } = (0, lodash_1.pick)(req.body, ["id", "notes"]);
            const { user_id } = (0, lodash_1.pick)(req.local, ["user_id", "userType"]);
            const [user, order] = await Promise.all([
                user_model_1.User.findById(user_id).exec(),
                OrdersController.prototype.singleOrder(id),
            ]);
            if (!user)
                throw new ApiError_1.default("NotFound", "Invalid account");
            if (!order)
                throw new ApiError_1.default("NotFound", "Selected order is not available");
            const generateId = [user.id, order?.id].join("-");
            const taxes = [
                {
                    name: "VAT",
                    description: "Order amount has %" + TAB_ORDERS_TAX + " from total amount.",
                    rate: {
                        type: "F",
                        value: order.payment_vat,
                    },
                },
            ];
            // taxes.push({
            //   name: "Payment vat",
            //   description: "Payment gateway VAT amount",
            //   rate: {
            //     type: "F",
            //     value: order.payment_vat,
            //   },
            // });
            TPayment.CreateCharge({
                currency: "SAR",
                customer: {
                    first_name: user.name,
                    email: user.email,
                },
                order: {
                    amount: order.total,
                    tax: taxes,
                },
                post: location + route,
                redirect: location + route,
                ref_order: "ref-" + generateId,
                description: notes,
                source: undefined,
                amount: 0,
            })
                .then(({ data }) => {
                super.send(res, { url: data.transaction.url });
            })
                .catch((err) => {
                const errors = err?.response?.data?.errors || [];
                const errorMessage = errors?.map((e) => e.description).join(" , ");
                return next(new ApiError_1.default("InternalServerError", errorMessage));
            });
        }
        catch (error) {
            next(error);
        }
    }
    async UpdateOrderStatus(req, res, next) {
        try {
            // const { user_id } = pick(req.local, ['user_id']);
            const { merchant, status, orderId, } = (0, lodash_1.pick)(req.body, ["merchant", "status", "orderId", "itemId"]);
            const orderStatus = {
                canceled: "canceled",
                completed: "completed",
                created: "under_review",
                in_review: "in_progress",
                in_transit: "in_progress",
                refunded: "restored",
            };
            const [order, user] = await Promise.all([
                order_model_1.Order.findOne({ _id: orderId, merchant }).exec(),
                user_model_1.User.findById(merchant).exec(),
            ]);
            const status_track = UpdateOrderTracking(status, order);
            order.status = status;
            // order.tracking_order_id ??= itemId;
            order.status_track = status_track;
            const token = await access_model_1.Token.findOne({
                userId: user.id,
            }).exec();
            const access_token = (0, authentication_1.CheckTokenExpire)(token);
            await Promise.all([
                await (0, index_1.UpdateOrderStatus)(orderStatus[status], order.order_id, access_token),
                order.save(),
            ]);
            super.send(res, "Order status updated successfully!!");
        }
        catch (error) {
            next(error);
        }
    }
    async UpdateProductsShipping(req, res, next) {
        try {
            const { id, shipping } = (0, lodash_1.pick)(req.body, ["id", "shipping"]);
            const shippingData = shipping?.map((item) => ({
                ...item,
                amount: Number(item.amount),
            }));
            order_model_1.Order.findByIdAndUpdate(id, {
                $set: {
                    products_shipping_services: shippingData,
                },
            }, { new: true }, (err, result) => {
                if (err)
                    throw new ApiError_1.default("UnprocessableEntity", err.message);
                super.send(res, "Order products shipping updated successfully!");
            });
        }
        catch (error) {
            next(error);
        }
    }
    async UpdateCustomerAddress(req, res, next) {
        try {
            const { id, postal_code, address, source } = (0, lodash_1.pick)(req.body, [
                "id",
                "postal_code",
                "address",
                "source",
            ]);
            order_model_1.Order.findByIdAndUpdate(id, {
                $set: {
                    [`shipping.${source}.shipping_address`]: address,
                    [`shipping.${source}.postal_code`]: postal_code,
                },
            }, { new: true }, (err, result) => {
                if (err)
                    throw new ApiError_1.default("UnprocessableEntity", err.message);
                super.send(res, "Order shipping address updated successfully!");
            });
        }
        catch (error) {
            next(error);
        }
    }
    async UpdateCustomerDetails(req, res, next) {
        try {
            const { id, ...rest } = (0, lodash_1.pick)(req.body, [
                "id",
                "first_name",
                "last_name",
                "mobile",
                "mobile_code",
            ]);
            order_model_1.Order.findByIdAndUpdate(id, {
                $set: {
                    customer: {
                        ...rest,
                    },
                },
            }, { new: true }, (err, result) => {
                if (err)
                    throw new ApiError_1.default("UnprocessableEntity", err.message);
                super.send(res, "Order customer information updated successfully!");
            });
        }
        catch (error) {
            next(error);
        }
    }
    singleOrder(id) {
        return new Promise((resolve, reject) => {
            order_model_1.Order.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(id),
                    },
                },
                ...aggregation_1.ordersAggregation,
            ], null, (error, result) => {
                if (error)
                    return reject(new ApiError_1.default("InternalServerError", error));
                const order = result[0];
                if (!order)
                    return reject(new ApiError_1.default("UnprocessableEntity", "Order not found"));
                resolve(order);
            });
        });
    }
}
function UpdateOrderTracking(status, order) {
    let obj;
    const orderJSON = order.toJSON();
    const tracking = orderJSON.status_track;
    obj = {
        createdAt: new Date(),
        status,
    };
    if (!tracking.length) {
        return [obj];
    }
    return [...tracking, obj];
}
exports.UpdateOrderTracking = UpdateOrderTracking;
_a = new OrdersController(), exports.GetAllOrders = _a.GetAllOrders, exports.GetSelectedOrder = _a.GetSelectedOrder, exports.DeleteOrder = _a.DeleteOrder, exports.CreatePaymentToSubscribe = _a.CreatePaymentToSubscribe, exports.UpdateOrderStatus = _a.UpdateOrderStatus, exports.UpdateProductsShipping = _a.UpdateProductsShipping, exports.UpdateCustomerAddress = _a.UpdateCustomerAddress, exports.singleOrder = _a.singleOrder, exports.UpdateCustomerDetails = _a.UpdateCustomerDetails;
