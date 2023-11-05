"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../../../../errors/ApiError"));
const request_1 = __importDefault(require("../../request"));
class AEShipping {
    async getProductShippingServices(params) {
        return new Promise((resolve, reject) => {
            const method = "aliexpress.logistics.buyer.freight.calculate";
            const data = {
                method,
                param_aeop_freight_calculate_for_buyer_d_t_o: JSON.stringify(params),
                sign_method: "sha256",
            };
            (0, request_1.default)(data).then(({ data }) => {
                console.log("shipping details");
                const error = data.error_response;
                const result = data?.aliexpress_logistics_buyer_freight_calculate_response?.result;
                if (error)
                    return reject(new ApiError_1.default("UnprocessableEntity", error.msg));
                return resolve(result);
            });
        });
    }
}
exports.default = new AEShipping();
