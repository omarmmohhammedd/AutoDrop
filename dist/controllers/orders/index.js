"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShipping = exports.UpdateCustomerAddress = exports.UpdateCustomeDetails = exports.UpdateOrderTracking = exports.UpdateOrderStatus = exports.CreatePaymentToSubscribe = exports.CreateAliExpressOrder = exports.DeleteOrder = exports.GetSelectedOrder = exports.GetAllOrders = void 0;
const order_model_1 = require("../../models/order.model");
const lodash_1 = require("lodash");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const PlaceOrder_1 = require("../../features/aliExpress/features/PlaceOrder");
const features_1 = require("./features");
const user_model_1 = require("../../models/user.model");
const payments_1 = require("../../features/payments");
const index_1 = require("../../features/salla/orders/index");
const authentication_1 = require("../../middlewares/authentication");
const mongoose_1 = require("mongoose");
const ModelsFactor_1 = __importDefault(require("../../features/ModelsFactor"));
const GenerateLocation_1 = __importDefault(require("../../features/GenerateLocation"));
const TabPayment_1 = __importDefault(require("../../features/TabPayment"));
const product_model_1 = require("../../models/product.model");
const PTPayment = new payments_1.PayTabPayment();
const TPayment = new TabPayment_1.default();
const { PT_REFUND_FEES, PT_TRANS_FEES, LOCAL_HTTP_WEBSOCKET, TAB_TAX, TAB_ORDERS_TAX, } = process.env;
async function GetAllOrders(req, res, next) {
    try {
        const { user_id, userType } = (0, lodash_1.pick)(req.local, [
            "user_id",
            "merchant",
            "userType",
        ]);
        const { page, search_key } = (0, lodash_1.pick)(req.query, ["page", "search_key"]);
        const orders = await (0, ModelsFactor_1.default)(order_model_1.Order, { page, search_key }, { ...(userType === "vendor" && { merchant: user_id }) });
        res.json(orders);
    }
    catch (error) {
        next(error);
    }
}
exports.GetAllOrders = GetAllOrders;
async function GetSelectedOrder(req, res, next) {
    try {
        const { user_id } = (0, lodash_1.pick)(req.local, ["user_id"]);
        const { id } = (0, lodash_1.pick)(req.params, ["id"]);
        if (!(0, mongoose_1.isValidObjectId)(id))
            throw new ApiError_1.default("UnprocessableEntity", "Invalid item");
        const order = await order_model_1.Order.findById(id).exec();
        if (!order)
            throw new ApiError_1.default("NotFound", "Selected order is invalid");
        const unpaidAmount = await (0, features_1.UnpaidPrices)([order]);
        const amountWithVat = (0, features_1.CollectVATPrice)(unpaidAmount);
        res.json({
            order,
            unpaid_amount: unpaidAmount,
            amount_included_vat: order.shippingFee ? amountWithVat + ((Number(order.shippingFee) * (Number(TAB_ORDERS_TAX || 0) / 100))) : amountWithVat,
            vat_value: Number(TAB_ORDERS_TAX || 0),
            shippingFee: order.shippingFee,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.GetSelectedOrder = GetSelectedOrder;
async function DeleteOrder(req, res, next) {
    try {
        const { user_id } = (0, lodash_1.pick)(req.local, ["user_id"]);
        const { id } = (0, lodash_1.pick)(req.body, ["id"]);
        order_model_1.Order.findOneAndDelete({
            _id: id,
            merchant: user_id,
        }, {}, function (err, result) {
            if (err)
                return next(new ApiError_1.default("InternalServerError", "Something went wrong while deleting selected order"));
            if (!result)
                return next(new ApiError_1.default("NotFound", "Item not found"));
            res.json({ message: "Selected order deleted successfully" });
        });
    }
    catch (error) {
        next(error);
    }
}
exports.DeleteOrder = DeleteOrder;
async function CreateAliExpressOrder(body) {
    return new Promise(async (resolve, reject) => {
        try {
            const { id, tranRef, cartId } = (0, lodash_1.pick)(body, ["id", "tranRef", "cartId"]);
            const order = await order_model_1.Order.findById(id).exec();
            if (!order)
                throw new ApiError_1.default("NotFound", "Invalid order");
            const { response: result, data } = await (0, PlaceOrder_1.PlaceOrder)(order);
            const amount = await (0, features_1.UnpaidPrices)([order]);
            if (!result.is_success) {
                const refundResult = await PTPayment.CreateTransaction("refund", cartId, tranRef, amount, "Order has been not sent to system");
                console.log("refund result =>", refundResult.data);
                console.log("place order result =>", result);
                return reject(new ApiError_1.default("ServiceUnavailable", 
                // data
                result?.msg ||
                    "Cannot send this request at that moment, try again later"));
            }
            // find and update order status
            await order_model_1.Order.findByIdAndUpdate(id, {
                $set: {
                    status: "in_transit",
                },
            }, { new: true });
            console.log("Order status updated =>", id);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.CreateAliExpressOrder = CreateAliExpressOrder;
async function CreatePaymentToSubscribe(req, res, next) {
    try {
        const location = (0, GenerateLocation_1.default)(req);
        const route = "/v1/payments/callback/pay-order";
        const { id } = (0, lodash_1.pick)(req.body, ["id"]);
        const { user_id } = (0, lodash_1.pick)(req.local, ["user_id", "userType"]);
        const [user, order] = await Promise.all([
            user_model_1.User.findById(user_id).exec(),
            order_model_1.Order.findById(id).exec(),
        ]);
        if (!user)
            throw new ApiError_1.default("NotFound", "Invalid account");
        if (!order)
            throw new ApiError_1.default("NotFound", "Selected order is not available");
        const orderJSON = order.toJSON();
        if (!orderJSON?.customer.first_name ||
            !orderJSON?.customer.middle_name ||
            !orderJSON?.customer.last_name ||
            !orderJSON?.customer.mobile) {
            throw new ApiError_1.default("409", 'Complete Customer Details First');
        }
        if (!orderJSON.shipping.address.country ||
            !orderJSON.shipping.address.city_en ||
            !orderJSON.shipping.address.postal_code ||
            !orderJSON.shipping.address.province_en ||
            !orderJSON.shipping.address.street_en ||
            !orderJSON.shipping.address.district_en)
            throw new ApiError_1.default("409", 'Complete Shipping Address First');
        const shippingFee = orderJSON.shippingFee;
        if (!shippingFee)
            throw new ApiError_1.default("409", 'Complete Products Shipping First');
        if (orderJSON.paid)
            throw new ApiError_1.default("409", 'This Order Has Been Paid Before ');
        const generateId = [user.id, order.id].join("-");
        const unpaidAmount = await (0, features_1.UnpaidPrices)([order]);
        const orderAmountWithVat = order.shippingFee ? (0, features_1.CollectVATPrice)(unpaidAmount) + ((Number(order.shippingFee) * (Number(TAB_ORDERS_TAX || 0) / 100))) : (0, features_1.CollectVATPrice)(unpaidAmount);
        const vatAmount = parseFloat((orderAmountWithVat - unpaidAmount).toFixed(2));
        // total order amount Shipping + VAT
        const orderTotalAmount = orderAmountWithVat + shippingFee;
        const items = orderJSON.items?.map((item) => {
            const productID = item?.product?.id;
            const quantity = item?.quantity;
            const meta = orderJSON.meta;
            const productVendorPrice = Number(meta[productID]?.vendor_price || 0) * quantity;
            const productPrice = Number(item?.product?.price?.amount || 0);
            const amount = parseFloat((productPrice - productVendorPrice).toFixed(2));
            return {
                amount,
                currency: "SAR",
                name: item?.product?.name,
                quantity,
                image: item?.product?.image,
            };
        });
        const taxes = [
            {
                name: "VAT",
                description: "Order amount has %" + TAB_ORDERS_TAX + " from total amount.",
                rate: {
                    type: "F",
                    value: vatAmount,
                },
            },
        ];
        taxes.push({
            name: "Shipping Fees",
            description: "shipping fees amount",
            rate: {
                type: "F",
                value: shippingFee,
            },
        });
        TPayment.CreateCharge({
            currency: "SAR",
            customer: {
                first_name: user.name,
                email: user.email,
            },
            order: {
                amount: orderTotalAmount,
                items,
                tax: taxes,
            },
            metadata: {
                orderId: id
            },
            post: location + route,
            redirect: location + route,
            ref_order: "ref-" + generateId,
            description: "Please Don't Put any logo on the products , We are using dropshipping service in our store.",
            source: undefined,
            amount: 0,
        })
            .then(({ data }) => {
            return res.json({ url: data.transaction.url });
        })
            .catch((err) => {
            console.log(err.response);
            const errors = err?.response?.data?.errors || [];
            const errorMessage = errors?.map((e) => e.description).join(" , ");
            return next(new ApiError_1.default("InternalServerError", errorMessage));
        });
    }
    catch (error) {
        next(error);
    }
}
exports.CreatePaymentToSubscribe = CreatePaymentToSubscribe;
async function UpdateOrderStatus(req, res, next) {
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
        const access_token = (0, authentication_1.CheckTokenExpire)(user?.tokens);
        await Promise.all([
            await (0, index_1.UpdateSalaOrderStatus)(orderStatus[status], order.order_id, access_token),
            order.save(),
        ]);
        res.json({
            message: "Order status updated successfully!!",
        });
    }
    catch (error) {
        next(error);
    }
}
exports.UpdateOrderStatus = UpdateOrderStatus;
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
const UpdateCustomeDetails = async (req, res, next) => {
    const { id, first_name, middle_name, last_name, mobile } = (0, lodash_1.pick)(req.body, ['id', 'first_name', 'middle_name', 'last_name', 'mobile']);
    try {
        const order = await order_model_1.Order.findById(id);
        if (!order)
            return next(new ApiError_1.default("NotFound"));
        await order_model_1.Order.findByIdAndUpdate(id, { $set: { 'customer.first_name': first_name, 'customer.last_name': last_name, 'customer.mobile': mobile, 'customer.middle_name': middle_name } }).then(() => res.sendStatus(200));
    }
    catch (error) {
        next(error);
    }
};
exports.UpdateCustomeDetails = UpdateCustomeDetails;
const UpdateCustomerAddress = async (req, res, next) => {
    const { id, city, province, district, street, postal_code } = (0, lodash_1.pick)(req.body, ['id', 'city', 'province', 'district', 'street', 'postal_code']);
    const order = await order_model_1.Order.findById(id);
    if (!order)
        return next(new ApiError_1.default("NotFound"));
    await order_model_1.Order.findByIdAndUpdate(id, { $set: {
            'shipping.address.country_code': 'SA',
            'shipping.address.country': 'SA',
            'shipping.address.city_en': city,
            'shipping.address.province_en': province,
            'shipping.address.district_en': district,
            'shipping.address.street_en': street,
            'shipping.address.postal_code': postal_code
        } }).then((response) => res.sendStatus(200));
};
exports.UpdateCustomerAddress = UpdateCustomerAddress;
const updateShipping = async (req, res, next) => {
    const { id, shipping } = (0, lodash_1.pick)(req.body, ['id', 'shipping']);
    const order = await order_model_1.Order.findById(id);
    let totalShippingAmount = 0;
    if (!order)
        return next(new ApiError_1.default("NotFound"));
    const promises = shipping.map(async (productShip, i) => {
        return product_model_1.Product.findById(productShip.product_id).then((product) => {
            const filter = {
                _id: id,
                "items.product.sku": product.sku,
            };
            const update = {
                $set: {
                    "items.$.product.shipping": {
                        serviceName: productShip.service_name,
                        amount: productShip.amount,
                        tracking: productShip.tracking,
                    },
                },
            };
            return order_model_1.Order.updateOne(filter, update).then(async () => {
                totalShippingAmount += parseFloat(productShip.amount);
            });
        });
    });
    // Wait for all update promises to complete before proceeding
    await Promise.all(promises);
    // Update the order's shippingFee with the totalShippingAmount
    order.shippingFee = totalShippingAmount;
    let orderShipVat = totalShippingAmount * (order.vat_value / 100);
    order.amount_included_vat += orderShipVat;
    await order.save();
    res.sendStatus(200);
};
exports.updateShipping = updateShipping;
