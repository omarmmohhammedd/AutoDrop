"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = void 0;
const node_cron_1 = require("node-cron");
const ModelsFactor_1 = __importDefault(require("../../../features/ModelsFactor"));
const request_1 = __importDefault(require("../../../features/aliExpress/request"));
const order_model_1 = require("../../../models/order.model");
const user_model_1 = require("../../../models/user.model");
const orders_1 = require("../../../features/salla/orders");
const authentication_1 = require("../../../middlewares/authentication");
// const time: string = "0 */12 * * *";
const time2 = "*/1 * * * *";
let recall = false;
let page = 1;
const trackingOrdersTask = (0, node_cron_1.schedule)(time2, async function () {
    await main();
});
async function main() {
    return new Promise(async (resolve) => {
        recall = await trackingOrders();
        if (!recall)
            return resolve(true);
        page += 1;
        await main();
        return resolve(true);
    });
}
async function trackingOrders() {
    return new Promise(async (resolve, reject) => {
        let hasMore = false;
        try {
            const orders = await (0, ModelsFactor_1.default)(order_model_1.Order, { page }, {
                tracking_order_id: {
                    $ne: null,
                },
            });
            const { data, pagination } = orders;
            await Promise.all(data?.map(async (order) => {
                const orderData = order.toJSON();
                const order_id = orderData.tracking_order_id;
                const body = {
                    method: "aliexpress.trade.ds.order.get",
                    single_order_query: JSON.stringify({ order_id }),
                };
                const { data: trackingResponse } = await (0, request_1.default)(body);
                const response = trackingResponse?.aliexpress_trade_ds_order_get_response;
                const list = response?.result?.child_order_list?.aeop_child_order_info;
            }));
            hasMore = pagination.hasNextPage || false;
            resolve(hasMore);
        }
        catch (error) {
            console.log("error while tracking order details => ", error);
        }
    });
}
exports.default = trackingOrdersTask;
const time = "0 0 */3 * *";
// const time: string = "*/5 * * * * *";
exports.updateOrderStatus = (0, node_cron_1.schedule)(time, async () => {
    console.log('Cron Start To Tracking And Update Order Status ');
    try {
        const orders = await order_model_1.Order.find({});
        if (orders.length) {
            orders.forEach(async (order) => {
                const orderData = order.toJSON();
                if (orderData.tracking_order_id) {
                    const body = {
                        method: "aliexpress.trade.ds.order.get",
                        single_order_query: JSON.stringify({ order_id: orderData.tracking_order_id }),
                        sign_method: "sha256",
                    };
                    const { data: trackingResponse } = await (0, request_1.default)(body);
                    const orderStatus = trackingResponse?.aliexpress_trade_ds_order_get_response?.result?.order_status;
                    const user = await user_model_1.User.findById(order.merchant);
                    const tokens = user?.tokens;
                    const access_token = (0, authentication_1.CheckTokenExpire)(tokens);
                    if (orderStatus === 'PLACE_ORDER_SUCCESS') {
                        await order_model_1.Order.findByIdAndUpdate(orderData.id, { status: 'in_review' });
                    }
                    else if (orderStatus === 'IN_CANCEL') {
                        await (0, orders_1.UpdateSalaOrderStatus)('canceled', order.order_id, access_token)
                            .then(async () => await order_model_1.Order.findByIdAndUpdate(orderData.id, { status: 'canceled' }));
                    }
                    else if (orderStatus === 'WAIT_SELLER_SEND_GOODS') {
                        await (0, orders_1.UpdateSalaOrderStatus)('in_progress', order.order_id, access_token).then(async () => await order_model_1.Order.findByIdAndUpdate(orderData.id, { status: 'in_progress' }));
                    }
                    else if (orderStatus === 'WAIT_BUYER_ACCEPT_GOODS') {
                        await (0, orders_1.UpdateSalaOrderStatus)('delivering', order.order_id, access_token).then(async () => await order_model_1.Order.findByIdAndUpdate(orderData.id, { status: 'delivering' }));
                    }
                    else if (orderStatus === 'FINISH') {
                        await (0, orders_1.UpdateSalaOrderStatus)('delivered', order.order_id, access_token).then(async () => await order_model_1.Order.findByIdAndUpdate(orderData.id, { status: 'completed' }));
                    }
                    else
                        return;
                }
            });
        }
    }
    catch (error) {
        console.log(error.response);
        // throw new ApiError('500',error)
    }
});
