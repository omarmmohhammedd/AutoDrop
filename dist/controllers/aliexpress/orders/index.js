"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeOrder = void 0;
const lodash_1 = require("lodash");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const PlaceOrder_1 = require("../../../features/aliExpress/features/PlaceOrder");
const baseApi_1 = __importDefault(require("../../../features/baseApi"));
const orders_1 = require("../../orders");
class AliExpressOrdersController extends baseApi_1.default {
    async placeOrder(req, res, next) {
        try {
            const { id } = (0, lodash_1.pick)(req.body, ["id"]);
            const order = await (0, orders_1.singleOrder)(id);
            if (!order)
                throw new ApiError_1.default("NotFound", "Invalid order");
            const placeOrderResult = await (0, PlaceOrder_1.PlaceOrder)(order);
            order.status = "in_review";
            await order.save();
            super.send(res, placeOrderResult);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.placeOrder = new AliExpressOrdersController().placeOrder;
