"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_model_1 = require("../../models/settings.model");
function findSettingKey(key) {
    return new Promise(async (resolve, reject) => {
        const document = await settings_model_1.Setting.findOne({ key }).exec();
        // if (!document)
        //   return reject(
        //     new ApiError(
        //       "NotFound",
        //       "Service is not found or unavailable at that moment"
        //     )
        //   );
        return resolve(document?.value);
    });
}
exports.default = findSettingKey;
