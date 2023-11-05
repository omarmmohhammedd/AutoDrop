import { AxiosError } from "axios";
import { pick } from "lodash";
import mongoose from "mongoose";
import { UpdateOrderTracking } from "../../controllers/orders";
import { CheckSubscription } from "../../controllers/subscription";
import generateOptions from "../../features/email/generateOptions";
import SendEmail from "../../features/email/send";
import { GenerateRandom, HashPassword } from "../../features/generator";
import SallaRequest from "../../features/salla/request";
import { Token } from "../../models/access.model";
import { Branch } from "../../models/branch.model";
import { Extension } from "../../models/extension.model";
import { Log } from "../../models/logs.model";
import { OptionItem } from "../../models/optionItem";
import { Order } from "../../models/order.model";
import { ProductItem } from "../../models/productItem.model";
import { Store } from "../../models/store.model";
import { Subscription } from "../../models/subscription.model";
import { Transaction } from "../../models/transaction.model";
import { User } from "../../models/user.model";
import { NewAccountKeys, messages } from "../../responses/messages";

abstract class SallaEventHelper {
  getVendorDetails(token: string) {
    return SallaRequest({ url: "oauth2/user/info", method: "get", token });
  }
}

export default class SallaEvents extends SallaEventHelper {
  // application events
  public async createStore(body: any) {
    return new Promise(async (resolve, reject) => {
      const { merchant, data } = pick(body, ["merchant", "data"]);
      const sallaExtension = await Extension.findOne({ type: "salla" }).exec();

      if (!sallaExtension) return;

      const existed = await Store.findOne({ merchant }).exec();

      // console.log("existed store =>", existed);

      if (existed) return;

      const store = new Store({
        merchant: merchant,
        extension: sallaExtension?.id,
      });

      store.save((err, result) => {
        // console.log("error while installing store", err);
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  public async authorize(body: any) {
    return new Promise(async (resolve, reject) => {
      const { merchant, data } = pick(body, ["merchant", "data"]);
      // console.log(data.access_token);

      const store = await Store.findOne({ merchant }).exec();
      if (!store) return;

      const account = await User.findOne({ store: store.id }).exec();

      if (account) return;

      super
        .getVendorDetails(data.access_token)
        .then(async ({ data: userInfo }) => {
          const info = userInfo.data;
          const randomPassword = GenerateRandom(8);
          const password = HashPassword(randomPassword);

          console.log("installed store => ", store);

          //  find and update account and store
          const newAccount = await User.create({
            password,
            name: info.name,
            email: info.email,
            mobile: info.mobile,
            avatar: info.merchant?.avatar,
            store: store.id,
            userType: "vendor",
          });

          const storeToken = await Token.findOne({
            store: store.id,
            userId: newAccount.id,
          }).exec();

          await Promise.all([
            Store.findByIdAndUpdate(store.id, {
              logo: info.merchant?.avatar,
              name: info.merchant?.name,
              username: info.merchant?.username,
              website: info.merchant?.domain,
              tax_number: info.merchant?.tax_number,
              commercial_number: info.merchant?.commercial_number,
              installation_date: info.merchant?.installation_date,
              userId: newAccount.id,
            }),
            storeToken
              ? Token.findOneAndUpdate(
                  {
                    store: store.id,
                    userId: newAccount.id,
                  },
                  {
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    expires: data.expires,
                    scope: data.scope,
                  }
                )
              : Token.create({
                  store: store.id,
                  userId: newAccount.id,
                  access_token: data.access_token,
                  refresh_token: data.refresh_token,
                  expires: data.expires,
                  scope: data.scope,
                }),
          ])
            .then(async () => {
              const options = generateOptions<NewAccountKeys>(
                // info?.email,
                "frontdev0219@gmail.com",

                messages["new-account"],
                {
                  "{{_EMAIL_}}": info?.email,
                  "{{_NAME_}}": info?.name,
                  "{{_PASSWORD_}}": randomPassword,
                }
              );
              await SendEmail(options);

              resolve(true);
            })
            .catch((error) => reject(error));

          // send an email
        })
        .catch((error: AxiosError | any) => reject(error));
    });
  }

  public async uninstall(body: any) {
    return new Promise(async (resolve, reject) => {
      const { merchant } = pick(body, ["merchant"]);
      const store = await Store.findOne({ merchant }).exec();
      if (!store) return;

      const account = await User.findOneAndDelete({ store: store.id }).exec();

      await Promise.all([
        store && store.delete(),
        account && account.delete(),
        Token.findOneAndDelete({ store: store.id, userId: account?.id }),
        Order.deleteMany({
          userId: account?.id,
        }),
        ProductItem.deleteMany({
          userId: account?.id,
        }),
        Subscription.deleteMany({
          user: account?.id,
        }),
        Transaction.deleteMany({
          user: account?.id,
        }),
        Log.deleteMany({
          userId: account?.id,
        }),
        Branch.deleteMany({
          userId: account?.id,
        }),
      ])
        .then(() => resolve(true))
        .catch((error) => reject(error));
    });
  }

  // order events
  public async newOrder(body: any) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        let total = 0,
          subTotal = 0,
          meta = {},
          userId = undefined;
        const { id, items, ...data } = pick(body.data, [
          "payment_method",
          "id",
          "order_id",
          "reference_id",
          "items",
          "shipping",
          "customer",
          "status",
          "shipment",
          "currency",
          "urls",
        ]);

        const isExisted = await Order.findOne({ order_id: id }).exec();

        if (isExisted) return resolve("Order is already existed!!");

        // collect order product ids

        // const mapItems = await Promise.all(
        //   filterItems.map((item: any) => {
        //     let totalValuesWithoutEarning = 0,
        //       totalValuesWithEarning = 0;
        //     const productId = item.product?.id;
        //     const orderOptions = item.options || [];
        //     const quantity = item.quantity || 0;
        //     const product = storeProducts.find(
        //       (pro) => pro.store_product_id == productId
        //     );
        //     const productOptions = product.options as OptionType[];

        //     const productValues: ValueType[] = new Array().concat(
        //       ...productOptions?.map((option: OptionType) => option.values)
        //     );

        //     const options = orderOptions
        //       .map((option: any) => {
        //         const value = productValues.find(
        //           (val) => val.store_value_id == option.value.id
        //         );

        //         if (value) {
        //           total += value.original_price;
        //           subTotal += value.price;
        //           totalValuesWithoutEarning += value.original_price;
        //           totalValuesWithEarning += value.price;
        //         }

        //         meta[productId] = {
        //           vendor_commission: product?.vendor_commission,
        //           price: totalValuesWithEarning,
        //           main_price: totalValuesWithoutEarning,
        //         };

        //         return {
        //           total: totalValuesWithoutEarning,
        //           subtotal: totalValuesWithEarning,
        //           option: omit(option, "value"),
        //           value,
        //         };
        //       })
        //       .filter((option: any) => option.value);

        //     if (!options.length) {
        //       total += product.main_price;
        //       subTotal += product.price;
        //     }

        //     userId = product.userId;

        //     return {
        //       quantity,
        //       options,
        //       product,
        //       sku: item?.sku,
        //       thumbnail: item?.product?.thumbnail,
        //     };
        //   })
        // );

        const mapItems = await Promise.all(
          items.map(async (item) => {
            const product : any = await ProductItem.findOne({
              store_product_id: item.product?.id,
            }) 
              .populate("productId")
              .select("-options")
              .exec();
            if (!product) return;

            const optionIds = await Promise.all(
              item.options.map(async (opt) => {
                const option = await OptionItem.findOne({
                  store_option_id: opt.id,
                }).exec();
                return option.id;
              })
            );

            return {
              productId: product.id,
              optionIds: optionIds.filter((opt) => opt),
              thumbnail: product.toJSON().productId?.images?.[0].original,
            };
          })
        );
        if(userId){
          const subscription = await CheckSubscription(userId, "orders_limit");
          
        if (!subscription) return resolve("invalid subscription");

        if (subscription.orders_limit) {
          subscription.orders_limit = subscription.orders_limit
            ? subscription.orders_limit - 1
            : 0;
        }

        const customer = pick(data.customer, [
          "first_name",
          "last_name",
          "mobile",
          "mobile_code",
          "avatar",
          "email",
        ]);
        const order = new Order({
          ...data,
          customer,
          items: mapItems.filter((e) => e),
          userId,
          status: "created",
          meta,
          order_id: id,
          total,
          subTotal,
        });

        order.status_track = UpdateOrderTracking("created", order);

        await subscription.save({
          session,
        });
        await order.save({
          session,
        });

        await session.commitTransaction();
        await session.endSession();

        resolve("order has inserted");
        }

      } catch (error) {
        console.log(error);
        await session.abortTransaction();
      }
    });
  }
  //  product events
}
