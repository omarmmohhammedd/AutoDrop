import SendEmail from "../../features/email/send";
import { GenerateRandom, HashPassword } from "../../features/generator";
import { User } from "../../models/user.model";
import { NewAccountKeys, messages } from "../../responses/messages";
import { Request, Response, NextFunction } from "express";
import { map, pick } from "lodash";
import generateOptions from "../../features/email/generateOptions";
import { GenerateToken } from "../../features/jwt";
import SallaRequest from "../../features/salla/request";
import {
  OptionType,
  Product,
  ProductDocument,
  ValueType,
} from "../../models/product.model";
import { Order } from "../../models/order.model";
import { CheckSubscription } from "../../controllers/subscription";
import { UpdateOrderTracking } from "../../controllers/orders";

export default class SallaEvents {
  async CreateNewApp(body: any, req: Request, next: NextFunction) {
    try {
      const { merchant, data } = pick(body, ["merchant", "data"]);

      const existed = await User.findOne({ merchantId: merchant }).exec();

      if (existed) return;

      const user = new User({
        name: data.app_name,
        merchantId: merchant,
        meta: JSON.stringify(data),
        storeName: data.app_name,
        userType: "vendor",
      });

      user.save(function (err: any, result: any) {
        if (err) return console.log(err);
        next();
      });
    } catch (error) {
      next(error);
    }
  }

  async AuthorizeEvent(body: any, req: Request, next: NextFunction) {
    try {
      let password: string, hashed: string, token: string | undefined;
      const { merchant, data } = pick(body, ["merchant", "data"]);

      const account = await User.findOne({
        merchantId: merchant,
        tokens: {
          $eq: null,
        },
      }).exec();

      if (!account) return;

      const { data: info } = await this.GetUserInfo(data.access_token);

      const { data: userInfo } = info;

      password = GenerateRandom(16);
      hashed = HashPassword(password);

      token = GenerateToken({
        merchant,
        token: JSON.stringify(data),
      });
      User.findOneAndUpdate(
        {
          merchantId: merchant,
          tokens: {
            $eq: null,
          },
        },
        {
          password: hashed,
          name: userInfo?.name,
          email: userInfo?.email,
          mobile: userInfo?.mobile,
          userInfo: JSON.stringify(userInfo?.merchant),
          avatar: userInfo?.merchant?.avatar,
          website: userInfo?.merchant?.domain,
          tokens: JSON.stringify(data),
        },
        { new: true },
        async function (err: any, result: any) {
          if (userInfo?.email) {
            // send email to new partner with email and new password
            const options = generateOptions<NewAccountKeys>(
              // userInfo?.email,
              // "frontdev0219@gmail.com",
              process.env.EMAIL_USERNAME,
              messages["new-account"],
              {
                "{{_EMAIL_}}": userInfo?.email,
                "{{_NAME_}}": userInfo?.name,
                "{{_PASSWORD_}}": password,
              }
            );
            await SendEmail(options);
          }
        }
      );
    } catch (error) {
      next(error);
    }
  }

  RemoveApp(body: any, req: Request, next: NextFunction) {
    try {
      const { merchant } = pick(body, ["merchant"]);

      User.findOneAndDelete(
        {
          merchantId: merchant,
        },
        {},
        function (err: any, result: any) {
          if (err) {
            console.log(err);
            return;
          }

          console.log("uninstall app: ", result);
        }
      );
    } catch (error) {
      next(error);
    }
  }

  GetUserInfo(token: string): Promise<any> {
    return SallaRequest({ url: "oauth2/user/info", method: "get", token });
  }

  DeleteSelectedProduct(body: any, req: Request, next: NextFunction) {
    try {
      const { id } = pick(body.data, ["id"]);
      Product.findOneAndDelete(
        {
          salla_product_id: id,
        },
        {},
        function (err: any, result: any) {
          // if (err) return console.log(err);
          // console.log(result);
        }
      );
    } catch (error) {
      next(error);
    }
  }

  DeleteSelectedOrder(body: any, req: Request, next: NextFunction) {
    try {
      const { id } = pick(body.data, ["id"]);
      Order.findOneAndDelete(
        {
          order_id: id,
        },
        {},
        function (err: any, result: any) {
          if (err) console.log(err);
        }
      );
    } catch (error) {
      next(error);
    }
  }

  async CreateNewOrder(body: any, res: Response, next: NextFunction) {
    try {
      let total: number = 0,
        sub_total: number = 0,
        commission: number = 0,
        meta: any = {};
      const { data: orderData } = pick(body, ["data"]);
      const data = pick(orderData, [
        "payment_method",
        "id",
        "order_id",
        "reference_id",
        "items",
        "shipping",
        "customer",
        "status",
      ]);

      const orderExisted = await Order.findOne({ order_id: data.id }).exec();

      if (orderExisted) return;

      const itemIds = map(data.items, "product.id");

      const products: any[] | null = await Product.find({
        salla_product_id: {
          $in: itemIds,
        },
      })
        .select(
          "name salla_product_id price main_price vendor_commission vendor_price merchant sku"
        )
        .exec();

      if (!(products as any[])?.length) return;

      const findProductIds = map(products, "salla_product_id");
      const filterItems = data.items?.filter((obj: any) => {
        return findProductIds.includes(obj?.product?.id?.toString());
      });

      const mapItems = await Promise.all(
        filterItems.map((item: any) => {
          const productId = item?.product?.id;
          const product = products.find(
            (ev: ProductDocument) => ev.salla_product_id == productId
          );
          const values = new Array().concat(
            ...(product?.options?.map((e: OptionType) => e.values) || [])
          );
          const options = item.options?.map((option: any) => {
            const findValue = values.find(
              (e: ValueType) => e.salla_value_id == option?.value?.id
            );
            if (!findValue) return option;
            const value = {
              price: {
                amount: findValue?.price,
              },
            };
            const result = {
              ...option,
              value: Object.assign({}, option?.value || {}, value),
            };

            return result;
          });

          // sub_total += parseFloat(item?.amounts?.total?.amount) || 0;
          sub_total += parseFloat(product.price) || 0;

          meta[productId] = {
            vendor_commission: product?.vendor_commission,
            vendor_price: product?.vendor_price,
          };

          return {
            sku: item?.sku,
            quantity: item?.quantity,
            thumbnail: item?.product?.thumbnail,
            product: {
              ...product,
            },
            options,
          };
        })
      );
      // commission = Math.ceil((+sub_total * +(APP_COMMISSION as string)) / 100);
      // total = +sub_total + commission;
      total = +sub_total;
      const merchant = products?.[0]?.merchant;

      const subscription = await CheckSubscription(merchant, "orders_limit");

      if (subscription.orders_limit)
        subscription.orders_limit = subscription.orders_limit - 1;

      const order = new Order({
        ...data,
        amounts: {
          total: {
            amount: total,
          },
          // app_commission: {
          //   amount: commission,
          //   percentage: parseInt(APP_COMMISSION as string, 10) || 0,
          // },
        },
        meta,
        merchant,
        order_id: data.id,
        items: mapItems,
        status: "created",
        status_track: [],
      });

      const status_track = UpdateOrderTracking("created", order);
      order.status_track = status_track;

      console.log("New order", order);

      await Promise.all([
        subscription.save(), // update orders limit
        order.save(function (err, result) {
          if (err) return console.log(err);
        }),
      ]);
      return res.status(200).send("order stored");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async UpdateOrderStatus(body: any, res: Response, next: NextFunction) {
    try {
      const { id } = pick(body.data, ["id"]);
      console.log("order id to update status => ", id);
      const order = await Order.findOne({ order_id: id }).exec();
      // console.log("order body status =>", body);

      if (!order) return console.log("selected order is invalid!");

      next();
    } catch (error) {}
  }
}
