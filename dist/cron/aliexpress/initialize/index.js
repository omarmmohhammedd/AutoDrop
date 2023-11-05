"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = require("node-cron");
const initialize_1 = require("../../../features/aliExpress/features/initialize");
const time = "0 0 */10 * *";
const initializeTask = (0, node_cron_1.schedule)(time, async function () {
    console.log("Update application token running..");
    await (0, initialize_1.updateToken)();
    console.log("Application token ended");
});
exports.default = initializeTask;
