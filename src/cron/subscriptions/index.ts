import moment from "moment";
import { schedule } from "node-cron";

// const time: string = "0 */24 * * *";
const time: string = "*/1 * * * *";

const checkSubscriptions = schedule(time, async function () {
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

function getDifferentDays(start: Date, end: Date) {
  const diff = moment(end).diff(moment(start), "day", true);
  const differentDays = Math.ceil(diff);
  return differentDays;
}

export default checkSubscriptions;
