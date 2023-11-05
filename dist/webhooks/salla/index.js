"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const newEvents_1 = __importDefault(require("./newEvents"));
const events = new newEvents_1.default();
async function AppWebHook(req, res, next) {
    try {
        const body = req.body;
        const { event } = (0, lodash_1.pick)(body, ["event"]);
        console.log("salla event => ", event);
        if (event === "app.installed") {
            events.createStore(body);
        }
        else if (event === "app.uninstalled") {
            events.uninstall(body);
        }
        else if (event === "app.store.authorize") {
            events.authorize(body);
        }
        else if (event === "order.created") {
            events.newOrder(body);
        }
        else
            return;
        res.send("works fine!");
    }
    catch (error) {
        console.log("error => ", error);
        next(error);
    }
}
exports.default = AppWebHook;
