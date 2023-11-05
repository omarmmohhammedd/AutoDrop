import Queue, { QueueOptions } from "bull";
import { syncBranches } from "./process/sync-branches";

const { REDIS_URL, REDIS_PORT } = process.env;
const globalOptions: QueueOptions = {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
};
// sudo service redis-server start #start redis server
// sudo service redis-server restart #restart redis server
// sudo service redis-server stop #stop redis server

export const SABranches = new Queue("salla-sync-branches", globalOptions);

SABranches.process(syncBranches);
