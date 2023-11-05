import { AxiosError } from "axios";
import { NextFunction, Request, Response } from "express";
import { pick } from "lodash";
import { Product, ProductSchema } from "../../../models/product.model";

import mongoose, { PipelineStage, isValidObjectId } from "mongoose";
import ApiError from "../../../errors/ApiError";
import BaseApi from "../../../features/baseApi";
import { options } from "../../../features/mongoPaginate";
import { productsAggregation } from "../../../features/productsAggregation";
import SallaProducts from "../../../features/salla/products/index";
import { Option } from "../../../models/option.model";
import { OptionItem } from "../../../models/optionItem";
import { ProductItem } from "../../../models/productItem.model";
import { SubscriptionDocument } from "../../../models/subscription.model";
import { UserDocument } from "../../../models/user.model";

const {
  DeleteProduct: DeleteSallaProduct,
  // createProduct,
  // updateVariant,
  GetProductVariants,
} = new SallaProducts();

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

class ProductsController extends BaseApi {
  // async CreateProduct(req: Request & any, res: Response, next: NextFunction) {
  // const session = await mongoose.startSession();
  // try {
  //   const transactionResult = await session.withTransaction(async () => {
  //     let token, account, mainProduct, mainProductOptions, pickedOptions;
  //     let subscription: SubscriptionDocument | null;

  //     const { access_token, user_id, userType } = pick(req.local, [
  //       "user_id",
  //       "access_token",
  //       "userType",
  //     ]);

  //     token = access_token;

  //     const {
  //       vendor_commission,
  //       original_product_id,
  //       sku,
  //       options,
  //       ...body
  //     } = pick(req.body, [
  //       "name",
  //       "description",
  //       "vendor_commission",
  //       "sku",
  //       "images",
  //       "options",
  //       "metadata_title",
  //       "metadata_description",
  //       "original_product_id",
  //     ]) satisfies Partial<ProductSchema>;

  //     pickedOptions = options.map((option) => {
  //       const values = option.values.map((value) => {
  //         const { original_price } = pick(value, ["original_price"]);
  //         return {
  //           ...value,
  //           price: original_price,
  //         };
  //       });

  //       return {
  //         ...option,
  //         values,
  //       };
  //     });
  //     subscription = await CheckSubscription(user_id, "products_limit");
  //     mainProduct = await Product.findOne({
  //       original_product_id,
  //     })
  //       .populate("options")
  //       .exec();

  //     // create new product first
  //     if (!mainProduct) {
  //       mainProduct = new Product({
  //         ...body,
  //         original_product_id,
  //       });
  //       mainProductOptions = await Option.insertMany(pickedOptions, {
  //         session,
  //       });
  //       mainProduct.options = mainProductOptions.map((option) => option.id);
  //       await mainProduct.save({ session });
  //       mainProductOptions = mainProductOptions;
  //     } else {
  //       mainProductOptions = mainProduct.toJSON().options;
  //     }

  //     const product = new ProductItem({
  //       vendor_commission,
  //       userId: user_id,
  //       productId: mainProduct.id,
  //       sku,
  //     });

  //     const options_1 = {
  //       method: "POST",
  //       url: "https://api.salla.dev/admin/v2/products",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       data: {
  //         name: mainProduct.name,
  //         product_type: "product",
  //         // quantity: mainProduct.quantity,
  //         description: mainProduct.description,
  //         sku,
  //         images: mainProduct.images,
  //         options: pickedOptions,
  //         price: pickedOptions?.[0]?.values?.[0]?.price,
  //       },
  //     };

  //     const valuesStock = new Array().concat(
  //       ...mainProductOptions.map((option: any) => option.values)
  //     );
  //     if (valuesStock.length > 100)
  //       throw new ApiError(
  //         "UnprocessableEntity",
  //         "Values count should be smaller than 100"
  //       );

  //     const { data: productResult } = await axios.request(options_1);
  //     // update options
  //     const productOptions = await Promise.all(
  //       mainProductOptions.map(async (option: any, index: number) => {
  //         let obj: any = option;
  //         const productOption = productResult.data.options[index];

  //         const values = await Promise.all(
  //           option.values.map((value: ValueItemType, idx: number) => {
  //             const optionValue = productOption?.values?.[idx];
  //             const mnp = getRandomInt(100000000000000, 999999999999999);
  //             const gitin = getRandomInt(10000000000000, 99999999999999);
  //             return {
  //               ...value,
  //               mpn: mnp,
  //               gtin: gitin,
  //               store_value_id: optionValue?.id,
  //             };
  //           })
  //         );

  //         obj.store_option_id = productOption?.id;
  //         obj.values = values;

  //         return {
  //           values,
  //           optionId: option.id,
  //           productId: product.id,
  //           userId: user_id,
  //           display_type: "text",
  //           store_option_id: productOption?.id,
  //         };
  //       })
  //     );

  //     const variants = {
  //       method: "GET",
  //       url: `https://api.salla.dev/admin/v2/products/${productResult.data.id}/variants`,
  //       headers: {
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };

  //     const { data: variantResult } = await axios.request(variants);

  //     const finalOptions = await Promise.all(
  //       productOptions.map(async (option: any) => {
  //         const values = await Promise.all(
  //           option.values.map(
  //             async (optionValue: ValueItemType & ValueType) => {
  //               const variants = variantResult.data || [];
  //               const variant = variants.find((item: any) =>
  //                 item.related_option_values?.includes(
  //                   optionValue.store_value_id
  //                 )
  //               );
  //               if (!variant) return;

  //               const { price, quantity, mpn, gtin, sku } = optionValue;
  //               const barcode = [mpn, gtin].join("");

  //               const variantOption = {
  //                 method: "PUT",
  //                 url: `https://api.salla.dev/admin/v2/products/variants/${variant.id}`,
  //                 headers: {
  //                   "Content-Type": "application/json",
  //                   Accept: "application/json",
  //                   Authorization: `Bearer ${token}`,
  //                 },
  //                 data: {
  //                   sku,
  //                   barcode,
  //                   price,
  //                   stock_quantity: quantity,
  //                   mpn,
  //                   gtin,
  //                 },
  //               };

  //               // send request to update variants
  //               const { data: result } = await axios(variantOption);
  //               return {
  //                 ...optionValue,
  //                 store_variant_id: result?.data?.id,
  //               };
  //             }
  //           )
  //         );

  //         return {
  //           ...option,
  //           values,
  //         };
  //       })
  //     );

  //     const productItemOptions = await OptionItem.insertMany(finalOptions, {
  //       session,
  //     });

  //     product.options = productItemOptions.map((option) => option.id);
  //     product.store_product_id = productResult.data?.id;

  //     if (subscription.products_limit)
  //       subscription.products_limit = subscription.products_limit - 1;

  //     await Promise.all([
  //       product.save({ session }),
  //       subscription.save({ session }),
  //       ...productOptions.map((option) => option.save({ session })),
  //     ]);

  //     super.send(res, {
  //       urls: productResult.data.urls || {},
  //     });
  //   });

  //   if (transactionResult) {
  //     console.log("transaction result successful");
  //   } else {
  //     console.log("transaction result aborted!!");
  //   }
  // } catch (error: AxiosError | any) {
  //   const isAxiosError = error instanceof AxiosError;
  //   const values = error?.response?.data;

  //   next(isAxiosError ? new ApiError("UnprocessableEntity", values) : error);
  // }
  // }
  async CreateProduct(req: Request & any, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      let mainProduct,
        token,
        mainProductOptions,
        subscription: SubscriptionDocument | null,
        pickedOptions,
        isIncludes: boolean = false,
        total = 0,
        qty = 0;

      const { access_token, user_id, userType } = pick(req.local, [
        "user_id",
        "access_token",
        "userType",
      ]);
      token = access_token;

      const { vendor_commission, original_product_id, options, ...body } = pick(
        req.body,
        [
          "name",
          "description",
          "vendor_commission",
          "images",
          "options",
          "metadata_title",
          "metadata_description",
          "original_product_id",
        ]
      ) satisfies Partial<ProductSchema>;


      pickedOptions = options.map((option, index) => {
        const values = option.values.map((value, idx) => {
          const { original_price, ...rest } = value || {};

          if (idx === 0 && index === 0) {
            total = rest.price;
            qty = rest.quantity;
          }

          return {
            ...rest,
            price: original_price,
          };
        });
        return {
          ...option,
          values,
        };
      });

      mainProduct = await Product.findOne({ original_product_id })
        .populate("options")
        .exec();

      isIncludes = !!mainProduct;
      // create main product if not existed with new new options
      if (!mainProduct) {
        mainProduct = new Product({ ...body, original_product_id });

        const optionsIncludesProductId = pickedOptions.map((option) => ({
          ...option,
          productId: mainProduct.id,
        }));
        mainProductOptions = await Option.insertMany(optionsIncludesProductId, {
          session,
        });

        mainProduct.options = mainProductOptions.map((option) => option.id);

        await mainProduct.save({ session });
      }

      const storeProduct:any = await SallaProducts.prototype.CreateProduct(
        { ...body, price: total, quantity: qty, options },
        token
      ).catch((error) => next(new ApiError("UnprocessableEntity", error)));
      const storeProductOptions = storeProduct?.options || [];

      pickedOptions = pickedOptions.map((option, index) => {
        const storeOption = storeProductOptions[index];
        const values = option.values.map((value, idx) => {
          const storeOptionValue = storeOption?.values?.[idx];
          value.store_value_id = storeOptionValue?.id;
          return value;
        });
        option.store_option_id = storeOption?.id;
        option.values = values;
        return option;
      });

      // get store product variants to update them based on related option

      const { data: variants }  :any= await SallaProducts.prototype.GetProductVariants(
        storeProduct?.id,
        token
      ).catch((error) => next(new ApiError("UnprocessableEntity", error)));
      pickedOptions = await Promise.all(
        pickedOptions.map(async (option) => {
          const values = await Promise.all(
            option.values.map(async (value) => {
              let variant;
              let price = parseFloat(
                Number(
                  value.price * (vendor_commission / 100) + value.price
                ).toFixed(2)
              );
              variant = variants.find((item) =>
                item.related_option_values?.includes(value.store_value_id)
              );

              if (!variant) return value;

              variant = await await SallaProducts.prototype.UpdateProductVariant(
                variant?.id,
                {
                  stock_quantity: value.quantity,
                  price,
                  cost_price: price,
                  sale_price: price,
                },
                token
              ).catch((error) =>
                next(new ApiError("UnprocessableEntity", error))
              );

              const { sku, mpn, gtin } = pick(variant?.data, [
                "sku",
                "mpn",
                "gtin",
              ]);

              return {
                ...value,
                sku,
                mpn,
                gtin,
                store_variant_id: variant?.id,
              };
            })
          );

          option.values = values;
          return option;
        })
      );

      const product = new ProductItem({
        productId: mainProduct.id,
        userId: user_id,
        store_product_id: storeProduct?.id,
        sku: storeProduct?.sku,
        vendor_commission,
      });
      const mainProductOptionIncludesOriginal = isIncludes
        ? mainProduct.options
        : mainProductOptions;

      let storeProductOptionsIncudesMainProductOptions = await Promise.all(
        pickedOptions.map((option) => {
          const productOption = mainProductOptionIncludesOriginal.find(
            (opt) => opt.name == option.name
          );

          option.optionId = productOption.id;
          option.productId = product.id;
          option.userId = user_id;
          return option;
        })
      );

      const savedStoreProductOptions = await OptionItem.insertMany(
        storeProductOptionsIncudesMainProductOptions,
        { session }
      );

      product.options = savedStoreProductOptions.map((option) => option.id);
      await product.save({ session });

      await session.commitTransaction();

      super.send(res, {
        urls: storeProduct.urls || {},
      });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }

  async GetAllProducts(req: Request & any, res: Response, next: NextFunction) {
    try {
      const { user_id, userType } = pick(req.local, ["user_id", "userType"]);
      const { page, search_key, min_price, max_price, vendor } = pick(
        req.query,
        ["page", "search_key", "vendor", "min_price", "max_price"]
      );

      const pipelines: PipelineStage[] = [
        {
          $match: {
            ...(search_key && {
              $text: {
                $search: search_key,
              },
            }),
            userId: {
              $eq: new mongoose.Types.ObjectId(user_id),
            },
          },
        },
        ...productsAggregation,
      ];
      const aggregate = ProductItem.aggregate(pipelines);

      // ProductItem.aggregatePaginate(
      //   aggregate,
      //   {
      //     ...options,
      //     page,
      //   },
      //   (error, products) => {
      //     if (error) {
      //       return next(new ApiError("UnprocessableEntity", error.message));
      //     }
      //     super.send(res, { products });
      //   }
      // );
    } catch (error) {
      next(error);
    }
  }

  async GetSelectedProduct(
    req: Request & any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = pick(req.params, ["id"]);

      if (!isValidObjectId(id))
        throw new ApiError("UnprocessableEntity", "Invalid item");

      const product = await Product.findById(id).exec();
      if (!product)
        throw new ApiError("NotFound", "Selected item is not found.");

      super.send(res, { product });
    } catch (error) {
      next(error);
    }
  }

  async DeleteProduct(req: Request & any, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();
    try {
      let token: string | undefined, account: UserDocument | null;
      const { user_id, access_token } = pick(req.local, [
        "user_id",
        "access_token",
        "userType",
      ]);
      const { id } = pick(req.body, ["id"]);
      session.startTransaction();

      const product = await ProductItem.findOne(
        { _id: id, userId: user_id },
        {},
        { session }
      ).exec();

      if (!product) throw new ApiError("NotFound", "Product not found");

      token = access_token;

      await DeleteSallaProduct(
        product?.store_product_id as string,
        token as string
      ).catch((error: AxiosError | any) =>
        next(new ApiError("UnprocessableEntity", error.response?.data))
      );

      await Promise.all([
        product.delete({ session }),
        OptionItem.deleteMany({ productId: id, userId: user_id }, { session }),
      ]);

      await session.commitTransaction();

      super.send(res, "Product deleted successful");
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      await session.endSession();
    }
  }
}

export const {
  CreateProduct,
  GetAllProducts,
  GetSelectedProduct,
  DeleteProduct,
} = new ProductsController();
