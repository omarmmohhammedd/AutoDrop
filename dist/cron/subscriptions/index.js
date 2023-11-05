"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const node_cron_1 = require("node-cron");
// const time: string = "0 */24 * * *";
const time = "*/1 * * * *";
const checkSubscriptions = (0, node_cron_1.schedule)(time, async function () {
    console.log("Check subscriptions running..");
    const diff = getDifferentDays(new Date("2023-08-11"), new Date());
    console.log(diff);
    //   await checkSubscriptions();
    console.log("Check subscriptions ended.");
});
// async function checkSubscriptions() {
//   return new Promise(async (resolve, reject) => {
//       try {
//         const
//       const subscriptions = await Subscription.find({
//           expire_date: {
//             $lt:
//         }
//       }).exec();
//     } catch (error) {
//       reject(error);
//     }
//   });
// }
function getDifferentDays(start, end) {
    const diff = (0, moment_1.default)(end).diff((0, moment_1.default)(start), "day", true);
    const differentDays = Math.ceil(diff);
    return differentDays;
}
exports.default = checkSubscriptions;
