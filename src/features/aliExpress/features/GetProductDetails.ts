import {
  ValueType,
  ImageType,
  ProductSchema,
  Product,
} from "../../../models/product.model";
import { OptionType } from "dayjs";
import { pick, map, uniqBy, filter, uniq } from "lodash";
import { TopClient } from "..";
import { basename, extname } from "path";
import ApiError from "../../../errors/ApiError";
import MakeRequest from "../request";
import axios, { AxiosError } from "axios";
import slugify from "slugify";
import { v4 as uuid } from "uuid";

const { ALI_APP_KEY, ALI_SECRET, ALI_BASE, ALI_TOKEN, ALI_REFRESH } =
  process.env;

export default class AEProduct {
  /**
   *
   * @param {product_id} - AliExpress product id to get details
   * @returns
   */

  async GetDetails({ product_id }: { product_id: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      MakeRequest({
        ship_to_country: "SA",
        product_id: product_id,
        target_currency: "SAR",
        target_language: "AR",
        method: "aliexpress.ds.product.get",
        sign_method: "sha256",
      })
        .then(async (response) => {
          const aeResponse = response?.data;
          const result = aeResponse?.aliexpress_ds_product_get_response?.result;
          const errorMessage =
          aeResponse?.error_response?.msg ||
          "There is something went wrong while getting product details or maybe this product is not available to shipping to SA, try another product or contact support.";
          if (!result)
            return reject(new ApiError("InternalServerError", errorMessage));
          
          const {
            ae_item_sku_info_dtos,
            ae_item_base_info_dto,
            ae_multimedia_info_dto,
          } = pick(result, [
            "ae_item_sku_info_dtos",
            "ae_item_base_info_dto",
            "ae_multimedia_info_dto",
          ]);
          const { subject, product_id, detail }: any =
            ae_item_base_info_dto || {};

          const { ae_item_sku_info_d_t_o: SKUs }: any =
            ae_item_sku_info_dtos || {};

          const [{ price, quantities, options }, images] = await Promise.all([
            AEProduct.prototype.GetProductOptions(SKUs || []),
            AEProduct.prototype.GetProductImages(
              ae_multimedia_info_dto?.image_urls
            ),
          ]);
          const values = new Array().concat(...options?.map((e) => e.values));
          const hasValues = values.length;
          // if (!hasValues)
          //   return reject(
          //     new ApiError("InternalServerError", "Try another product")
          //   );

          const data: ProductSchema = {
            name: subject,
            description: detail,
            price: price,
            main_price: price,
            quantity: quantities,
            sku: uuid(),
            images: images
              ?.slice(0, 10)
              ?.map((img: ImageType, index: number) => ({
                ...img,
                default: index === 0,
              })),
            options: options,
            metadata_title: subject,
            metadata_description: subject,
            product_type: "product",
            original_product_id: product_id,
            merchant: "",
            salla_product_id: "",
            vendor_commission: undefined,
            vendor_price: undefined,
            require_shipping: true,
            shipping: undefined,
          };
          const product = new Product(data).toJSON();
          // resolve({ ...product, result });
          resolve(product);
        })
        .catch((error: AxiosError | any) => {
          const err = error?.response?.data;
          reject(new ApiError("InternalServerError", err));
        });
    });
  }

  private async GetProductOptions(SKUs: object[]) {
    let quantities: number = 0,
      price: number = 0,
      options: any[] = [],
      concatValues: any[] = [],
      collectOptions: any[] = [],
      collectValues: any[] = [];
    collectValues = SKUs.map((sku: any) => {
     
      return sku?.ae_sku_property_dtos?.ae_sku_property_d_t_o?.map(
        (ev: any) => {
          const {
            sku_image,
            sku_price,
            sku_stock,
            sku_code,
            sku_available_stock,
            offer_sale_price,
            id
          } = sku;
          const quantity =
            sku_available_stock > 100 ? 100 : sku_available_stock;
       
          quantities += parseFloat(quantity || 0);

          return {
            ...ev,
            sku_image,
            sku_price,
            sku_stock,
            sku_code,
            quantity,
            id,
            offer_sale_price,
          };
        }
      );
    });

    concatValues = await Promise.all(new Array().concat(...collectValues));

    collectOptions = uniq(map(concatValues, "sku_property_name"));
    let sku_image_1;
    options = await Promise.all(
      collectOptions
        .map((option: string, index: number) => {
          const uniqValues = uniqBy(
            concatValues
              ?.filter(
                (val) => val?.sku_property_name === option && val?.sku_stock
              )
              .map((e: any) => ({
                ...e,
                property_value_definition_name:
                  e?.property_value_definition_name || e?.sku_property_value,
              })),
            "property_value_definition_name"
          );
          const values = uniqValues?.map((val, idx: number) => {
            const isFirst = index == 0 && idx == 0;
            const {
              sku_image,
              property_value_definition_name,
              quantity,
              property_value_id,
              sku_property_id,
              id,
              sku_price,
              offer_sale_price,
            } = val;
            const valuePrice = parseFloat(sku_price);
            const offerPrice = parseFloat(offer_sale_price);
            const valPrice =
              valuePrice === offerPrice ? valuePrice : offerPrice;
            const displayValue = slugify(property_value_definition_name, {
              lower: true,
            });
            sku_image_1 = sku_image;

            if (isFirst) {
              price = valPrice;
            }

            return {
              name: property_value_definition_name,
              price: valPrice,
              original_price: valPrice,
              quantity: quantity,
              is_default: isFirst,
              property_id: property_value_id,
              sku_id: sku_property_id,
              display_value: displayValue,
              sku: [sku_property_id, property_value_id].join(":"),
              id
            };
          });
          return {
            name: option,
            display_type: sku_image_1 ? "image" : "text",
            values,
          };
        })
        .filter((e) => e.name !== "Ships From")
    );

    return { price, quantities, options };
  }

  private async GetProductImages(URLs: string) {
    // const splitImages = ae_multimedia_info_dto?.image_urls?.split(";");
    const splitImages = URLs?.split(";");
    const images: ImageType[] = splitImages?.map((obj, index: number) => ({
      original: obj,
      thumbnail: obj,
      alt: "image " + index,
      default: false,
    }));

    return images;
  }

  /**
   *
   * @param url aliexpress product URL
   * @returns product ID from URL
   */
  public GetProductId(url: string): string {
    const { pathname }: URL = new URL(url);
    const filename = basename(pathname);
    const product_id = filename.replace(extname(filename), "");

    return product_id;
  }
}

export const {GetDetails,GetProductId} = new AEProduct()