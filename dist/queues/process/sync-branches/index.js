"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncBranches = void 0;
const request_1 = __importDefault(require("../../../features/salla/request"));
let page = 1;
let recall = false;
const syncBranches = (job) => {
    return new Promise(async (resolve) => {
        const { user_id, token } = job.data;
        await main(token);
        // sendNamespaceRoomMessage(user_id, "Branches maybe synced!!");
        resolve(true);
    });
};
exports.syncBranches = syncBranches;
async function main(token) {
    return new Promise(async (resolve) => {
        recall = await fetchBranches(token, page);
        if (!recall)
            return resolve(true);
        page += 1;
        await main(token);
        return resolve(true);
    });
}
async function fetchBranches(token, page) {
    let hasMore = false;
    try {
        console.log("called!!");
        const { data } = await (0, request_1.default)({
            token,
            url: "products",
            method: "get",
            params: { page, per_page: 10 },
        });
        const pagination = data.pagination;
        hasMore = pagination.total !== pagination.currentPage;
        return hasMore;
    }
    catch (error) {
        const errorResponse = error?.response?.data;
        console.log(errorResponse);
    }
}
