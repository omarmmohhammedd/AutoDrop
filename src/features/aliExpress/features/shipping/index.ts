import ApiError from "../../../../errors/ApiError";
import MakeRequest from "../../request";

interface ShippingParams {
  sku_id: string;
  city_code: string;
  country_code?: string;
  product_id: string;
  product_num: string;
  province_code?: string;
  send_goods_country_code?: string;
  price_currency?: string;
}
class AEShipping {
  public async getProductShippingServices(params: ShippingParams) {
    return new Promise((resolve, reject) => {
      const method = "aliexpress.logistics.buyer.freight.calculate";
      const data = {
        method,
        param_aeop_freight_calculate_for_buyer_d_t_o: JSON.stringify(params),
        sign_method: "sha256",
      };

      MakeRequest(data).then(({ data }) => {
        console.log("shipping details");
        const error = data.error_response;
        const result =
          data?.aliexpress_logistics_buyer_freight_calculate_response?.result;

        if (error)
          return reject(new ApiError("UnprocessableEntity", error.msg));
        return resolve(result);
      });
    });
  }
}

export default new AEShipping();
