"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = require("node-cron");
const ModelsFactor_1 = __importDefault(require("../../../features/ModelsFactor"));
const request_1 = __importDefault(require("../../../features/aliExpress/request"));
const order_model_1 = require("../../../models/order.model");
// const time: string = "0 */12 * * *";
const time = "*/1 * * * *";
let recall = false;
let page = 1;
const trackingOrdersTask = (0, node_cron_1.schedule)(time, async function () {
    await main();
    console.log("orders updated");
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
                const order_id = JSON.parse(order.tracking_order_id)?.[0];
                const body = {
                    method: "aliexpress.trade.ds.order.get",
                    single_order_query: JSON.stringify({ order_id }),
                };
                const { data: trackingResponse } = await (0, request_1.default)(body);
                const response = trackingResponse?.aliexpress_trade_ds_order_get_response;
                const list = response?.result?.child_order_list?.aeop_child_order_info;
                // const error =
                console.log(`${order_id} => `, response);
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
