import { schedule } from "node-cron";
import { updateToken } from "../../../features/aliExpress/features/initialize";

const time: string = "0 0 */10 * *";

const initializeTask = schedule(time, async function () {
  console.log("Update application token running..");
  await updateToken();
  console.log("Application token ended");
});

export default initializeTask;
