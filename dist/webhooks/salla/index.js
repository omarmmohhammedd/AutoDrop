"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("./events"));
const events = new events_1.default();
function AppWebHook(req, res, next) {
    try {
        const body = req.body;
        const { event, ...other } = body;
        console.log("new event => ", event);
        switch (event) {
            case "app.store.authorize":
                return events.AuthorizeEvent(body, req, next);
            case "app.installed":
                return events.CreateNewApp(body, req, next);
            case "app.uninstalled":
                return events.RemoveApp(body, req, next);
            case "app.expired":
            case "app.updated":
            case "order.deleted":
                return events.DeleteSelectedOrder(body, req, next);
            case "order.created":
                return events.CreateNewOrder(body, res, next);
            case "order.status.updated":
                return events.UpdateOrderStatus(body, res, next);
            case "product.deleted":
                return events.DeleteSelectedProduct(body, req, next);
            case "order.deleted":
                return events.DeleteSelectedOrder(body, req, next);
            default:
                return true;
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}
exports.default = AppWebHook;
