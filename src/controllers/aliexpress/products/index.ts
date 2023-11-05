import { NextFunction, Request, Response } from "express";
import { pick } from "lodash";

import ApiError from "../../../errors/ApiError";
import {
  GetDetails,
  GetProductId,
} from "../../../features/aliExpress/features/GetProductDetails";
import MakeRequest from "../../../features/aliExpress/request";
import BaseApi from "../../../features/baseApi";
import { Product } from "../../../models/product.model";
import { CheckSubscription } from "../../subscription";

class AliExpressProducts extends BaseApi {
  async GetProductDetails(
    req: Request & any,
    res: Response,
    next: NextFunction
  ) {
    try {
      // console.log(ALI_APP_KEY, ALI_SECRET);
      const { user_id, userType } = pick(req.local, ["user_id", "userType"]);
      const { url } = pick(req.body, ["url"]);
      let product;

      const product_id = GetProductId(url);
      if (userType === "vendor")
        await CheckSubscription(user_id, "products_limit");

      product = await Product.findOne({ original_product_id: product_id })
        .populate([{ path: "options" }])
        .exec();

      if (!product) {
        product = await GetDetails({ product_id });
      }

      super.send(res, { product });
    } catch (error) {
      next(error);
    }
  }

  async GetProductShipping(
    req: Request & any,
    res: Response,
    next: NextFunction
  ) {
    const { product_id, product_num } = pick(req.body, [
      "product_id",
      "product_num",
    ]);
    const method = "aliexpress.logistics.buyer.freight.calculate";
    const data = {
      method,
      param_aeop_freight_calculate_for_buyer_d_t_o: JSON.stringify({
        // sku_id,
        country_code: "SA",
        product_id,
        product_num,
        // province_code: "CN",
        send_goods_country_code: "CN",
        price_currency: "SAR",
      }),
      sign_method: "sha256",
    };

    MakeRequest(data).then(({ data }) => {
      const error = data.error_response;
      const result =
        data?.aliexpress_logistics_buyer_freight_calculate_response?.result
          ?.aeop_freight_calculate_result_for_buyer_d_t_o_list
          ?.aeop_freight_calculate_result_for_buyer_dto;
      if (error) return next(new ApiError("UnprocessableEntity", error.msg));
      super.send(res, result);
    });
  }
}

export const { GetProductDetails, GetProductShipping } =
  new AliExpressProducts();
