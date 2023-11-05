import { NextFunction, Request, Response, response } from "express";
import { gt, map, pick, uniq, uniqBy, update } from "lodash";
import { basename, extname } from "path";
import { TopClient } from "../../features/aliExpress";
import axios, { AxiosError } from "axios";
import SallaEvents from "../../webhooks/salla/events"
const CC = require('currency-converter-lt')

import {
  ImageType,
  OptionType,
  Product,
  ProductSchema,
  ValueType,
} from "../../models/product.model";

import SallaProducts from "../../features/salla/products/index";
import ApiError from "../../errors/ApiError";
import { PaginationParameters } from "mongoose-paginate-v2";
import { UserDocument, User } from "../../models/user.model";
import {
  Subscription,
  SubscriptionDocument,
} from "../../models/subscription.model";
import { CheckSubscription } from "../subscription";
import { CheckTokenExpire } from "../../middlewares/authentication";
import { isValidObjectId } from "mongoose";
import ModelFactor from "../../features/ModelsFactor";
import AEProduct from "../../features/aliExpress/features/GetProductDetails";
import Logger from "../../features/logger";
import MakeRequest from "../../features/aliExpress/request";

const { GetDetails, GetProductId } = new AEProduct();
const { CreateProduct: CreateSallaProduct, DeleteProduct: DeleteSallaProduct } =
  new SallaProducts();

  const UpdateProductVariant = async(variantId,barcode,price,stock_quantity,mpn,gtin,sku,token)=>{

                  const options = {
                    method: 'PUT',
                    url: `https://api.salla.dev/admin/v2/products/variants/${variantId}`,
                    params: {
                      sku,
                      barcode,
                      price,
                      stock_quantity
                    },
                    headers: {
                      'Content-Type': 'application/json',
                      Accept: 'application/json',
                      Authorization: `Bearer ${token}`
                    },
                    data: {
                      sku,
                      barcode,
                      price,
                      stock_quantity,
                      mpn,
                      gtin
                    }
                  };

                  try {
                    const { data } = await axios.request(options);
                    return data
                  } catch (error) {
                  }
                    }
const {GetUserInfo} = new SallaEvents()

export async function getProductShippingDetails (req:Request,res:Response,next:NextFunction){
  const product_id = Number(req.params.id)
  const product_num = Number(req.body.product_num)
  try {
    await MakeRequest({
      method:'aliexpress.logistics.buyer.freight.get',        
      sign_method: "sha256",
      aeopFreightCalculateForBuyerDTO:JSON.stringify({
        sku_id:'123123123123123',
        country_code:'SA',
        product_id,
        product_num,
        price_currency:"SAR"
      }),
    
    }).then(response=>res.json({productShipping:response?.data.aliexpress_logistics_buyer_freight_get_response?.result?.aeop_freight_calculate_result_for_buyer_dtolist}))
  } catch (error) {
    console.log(error.data)
  }

}

export async function GetProductDetails(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { user_id, userType } = pick(req.local, ["user_id", "userType"]);
    const { url } = pick(req.body, ["url"]);

    const product_id = GetProductId(url);
    if (userType === "vendor")
      await CheckSubscription(user_id, "products_limit");

    const product = await GetDetails({ product_id });

    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function CreateProduct(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined, account: UserDocument | null;
    let subscription: SubscriptionDocument | null;

    const { access_token, user_id, userType } = pick(req.local, [
      "user_id",
      "access_token",
      "userType",
    ]);

    const { merchant, vendor_commission, main_price, ...body } = pick(
      req.body,
      [
        "name",
        "description",
        "vendor_commission",
        "main_price",
        "price",
        "quantity",
        "sku",
        "images",
        "options",
        "metadata_title",
        "metadata_description",
        "product_type",
        "original_product_id",
        "merchant",
      ]
    ) satisfies Partial<ProductSchema>;

    subscription = await CheckSubscription(
      userType === "vendor" ? user_id : merchant,
      "products_limit"
    );

    const product = new Product({
      ...body,
      vendor_commission,
      main_price,
      merchant: userType === "vendor" ? user_id : merchant,
    });
    const vendor_price = parseFloat(
      ((main_price * vendor_commission) / 100).toFixed(2)
    );

    product.vendor_price = vendor_price;
    product.vendor_commission = vendor_commission;

    const options = body?.options?.map((option: any) => {
      const values = option.values;
      return {
        ...option,
        values: values?.map((value) => {
          const valuePrice = value.original_price;
          const vendorOptionPrice = parseFloat(
            (valuePrice + (valuePrice * vendor_commission) / 100).toFixed(2)
          );

          return {
            ...value,
            original_price: valuePrice,
            price: vendorOptionPrice,
          };
        }),
      };
    });

    product.options = options;

    token = access_token;

    if (userType === "admin") {
      account = await User.findOne({
        _id: merchant,
        userType: "vendor",
      }).exec();
    }

    const options_1 = {
      method: "POST",
      url: "https://api.salla.dev/admin/v2/products",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        name: product.name,
        price: product.price,
        product_type: product.product_type,
        quantity: product.quantity,
        description: product.description,
        cost_price: product.main_price,
        require_shipping: product.require_shipping,
        sku: product.sku + 10,
        images: product.images,
        options: product.options,
      },
    };

    const jsonProduct = product.toJSON();

    const valuesStock = new Array().concat(
      ...jsonProduct.options.map((option: OptionType) => option.values)
    );
    if (valuesStock.length > 100)
      throw new ApiError(
        "UnprocessableEntity",
        "Values count should be smaller than 100"
      );

    const { data: productResult } = await axios.request(options_1);

    // update options
    product.options = await Promise.all(
      jsonProduct.options.map(async (option: OptionType, index: number) => {
        let obj: OptionType = option;
        const productOption = productResult.data.options[index];

        const values = await Promise.all(
          option.values.map((value: ValueType, idx: number) => {
            const optionValue = productOption?.values?.[idx];
            const mnp = getRandomInt(100000000000000, 999999999999999);
            const gitin = getRandomInt(10000000000000, 99999999999999);
            return {
              ...value,
              mpn: mnp,
              gtin: gitin,
              salla_value_id: optionValue?.id,
            };
          })
        );

        obj.salla_option_id = productOption?.id;
        obj.values = values;
      })
    );
   
    const variants = {
      method: "GET",
      url: `https://api.salla.dev/admin/v2/products/${productResult.data.id}/variants`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data: variantResult } = await axios.request(variants);
    const finalOptions = await Promise.all(
      jsonProduct.options.map(async (option: OptionType) => {
        const values = await Promise.all(
          option.values.map(async (optionValue: any) => {
            const variants = variantResult.data || [];
            const variant = variants.find((item: any) =>
              item.related_option_values?.includes(optionValue.salla_value_id)
            );
            if (!variant) return;
            const { price, quantity, mpn, gtin, sku,id } = optionValue;
            const barcode = [mpn, gtin].join("");
            const result = await UpdateProductVariant(variant.id,barcode,price,quantity,mpn,gtin,sku,token)
            return {
              ...optionValue,
              salla_variant_id: result?.data?.id,
            };
          })
        );
        return {
          ...option,
          values,
        };
      })
    );

      
    product.options = finalOptions;
    product.salla_product_id = productResult.data?.id;

    if (subscription.products_limit)
      subscription.products_limit = subscription.products_limit - 1;

    await Promise.all([product.save(), subscription.save()]);

    res.status(200).json({
      message: "Product created successfully",
      result: {
        urls: productResult.data.urls || {},
      },
    });

  } catch (error: AxiosError | any) {
    const isAxiosError = error instanceof AxiosError;
    const values = error?.response?.data;
    next(isAxiosError ? new ApiError("UnprocessableEntity", values) : error);
  }
}

export async function GetAllProducts(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { user_id, userType } = pick(req.local, ["user_id", "userType"]);
    const { page, search_key, min_price, max_price, vendor } = pick(req.query, [
      "page",
      "search_key",
      "vendor",
      "min_price",
      "max_price",
    ]);
    const populate = [
      {
        path: "merchant",
        select: "name avatar email mobile",
      },
    ];
    const query = {
      ...(userType === "vendor" && { merchant: user_id }),
      ...(vendor && { merchant: vendor }),
      price: {
        $gte: parseFloat(min_price) || 0,
        ...(max_price && { $lte: parseFloat(max_price) || 0 }),
      },
    };

    const products = await ModelFactor(
      Product,
      { page, search_key, populate },
      query
    );

    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function GetSelectedProduct(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = pick(req.params, ["id"]);

    if (!isValidObjectId(id))
      throw new ApiError("UnprocessableEntity", "Invalid item");

    const product = await Product.findById(id).exec();
    if (!product) throw new ApiError("NotFound", "Selected item is not found.");

    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function DeleteProduct(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined, account: UserDocument | null;
    const { user_id, access_token, userType } = pick(req.local, [
      "user_id",
      "access_token",
      "userType",
    ]);
    const { id } = pick(req.body, ["id"]);
    const product = await Product.findOne({
      // merchant: user_id,
      _id: id,
    }).exec();

    if (!product) throw new ApiError("NotFound", "Product not found");

    token = access_token;

    if (userType === "admin") {
      account = await User.findOne({
        userType: "vendor",
        _id: product?.merchant,
      }).exec();

      if (!account) throw new ApiError("NotFound", "Account not found");

      token = JSON.parse(account?.tokens)?.access_token;
    }

    DeleteSallaProduct(product?.salla_product_id as string, token as string)
      .then(async ({ data }: any) => {
        await product.delete();
        res.json({
          message: data?.data?.message,
        });
      })
      .catch((error: AxiosError | any) => {
        return next(new ApiError("UnprocessableEntity", error.response?.data));
      });
  } catch (error) {
    next(error);
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}


export async function currencyConverterr (req:Request,res:Response,next:NextFunction){
  const {from,amount} = req.query
  const converter = new CC({from,to:'SAR'})
  converter.convert(Number(amount)).then((price)=>{
    if(price){
      res.json({price})
    }else {
      res.sendStatus(200)
    }
  })
 
}