"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SABranches = void 0;
const bull_1 = __importDefault(require("bull"));
const sync_branches_1 = require("./process/sync-branches");
const { REDIS_URL, REDIS_PORT } = process.env;
const globalOptions = {
    redis: {
        host: "127.0.0.1",
        port: 6379,
    },
};
// sudo service redis-server start #start redis server
// sudo service redis-server restart #restart redis server
// sudo service redis-server stop #stop redis server
exports.SABranches = new bull_1.default("salla-sync-branches", globalOptions);
exports.SABranches.process(sync_branches_1.syncBranches);
