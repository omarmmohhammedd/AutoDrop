"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllLogs = exports.CreateLog = void 0;
const lodash_1 = require("lodash");
const logs_model_1 = require("../../models/logs.model");
async function CreateLog(data, next) {
    try {
        const { body, ...others } = data;
        await logs_model_1.Log.create({
            body: JSON.stringify(body),
            ...others,
        });
        next();
    }
    catch (error) {
        next(error);
    }
}
exports.CreateLog = CreateLog;
async function GetAllLogs(req, res, next) {
    try {
        const { user_id } = (0, lodash_1.pick)(req.local, ["user_id"]);
        const logs = await logs_model_1.Log.paginate({
            merchant: user_id,
        });
        res.json(logs);
    }
    catch (error) {
        next(error);
    }
}
exports.GetAllLogs = GetAllLogs;
