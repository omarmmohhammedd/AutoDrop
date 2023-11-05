"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncBranches = void 0;
const lodash_1 = require("lodash");
const queues_1 = require("../../queues");
async function syncBranches(req, res, next) {
    try {
        const { user_id, access_token } = (0, lodash_1.pick)(req.local, [
            "user_id",
            "access_token",
        ]);
        res.send("Queue started to sync your branches");
        await queues_1.SABranches.add({
            user_id,
            token: access_token,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.syncBranches = syncBranches;
