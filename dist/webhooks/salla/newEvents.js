"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const mongoose_1 = __importDefault(require("mongoose"));
const orders_1 = require("../../controllers/orders");
const subscription_1 = require("../../controllers/subscription");
const generateOptions_1 = __importDefault(require("../../features/email/generateOptions"));
const send_1 = __importDefault(require("../../features/email/send"));
const generator_1 = require("../../features/generator");
const request_1 = __importDefault(require("../../features/salla/request"));
const access_model_1 = require("../../models/access.model");
const branch_model_1 = require("../../models/branch.model");
const extension_model_1 = require("../../models/extension.model");
const logs_model_1 = require("../../models/logs.model");
const optionItem_1 = require("../../models/optionItem");
const order_model_1 = require("../../models/order.model");
const productItem_model_1 = require("../../models/productItem.model");
const store_model_1 = require("../../models/store.model");
const subscription_model_1 = require("../../models/subscription.model");
const transaction_model_1 = require("../../models/transaction.model");
const user_model_1 = require("../../models/user.model");
const messages_1 = require("../../responses/messages");
class SallaEventHelper {
    getVendorDetails(token) {
        return (0, request_1.default)({ url: "oauth2/user/info", method: "get", token });
    }
}
class SallaEvents extends SallaEventHelper {
    // application events
    async createStore(body) {
        return new Promise(async (resolve, reject) => {
            const { merchant, data } = (0, lodash_1.pick)(body, ["merchant", "data"]);
            const sallaExtension = await extension_model_1.Extension.findOne({ type: "salla" }).exec();
            if (!sallaExtension)
                return;
            const existed = await store_model_1.Store.findOne({ merchant }).exec();
            console.log("existed store =>", existed);
            if (existed)
                return;
            const store = new store_model_1.Store({
                merchant: merchant,
                extension: sallaExtension?.id,
            });
            store.save((err, result) => {
                console.log("error while installing store", err);
                if (err)
                    return reject(err);
                resolve(result);
            });
        });
    }
    async authorize(body) {
        return new Promise(async (resolve, reject) => {
            const { merchant, data } = (0, lodash_1.pick)(body, ["merchant", "data"]);
            console.log(data.access_token);
            const store = await store_model_1.Store.findOne({ merchant }).exec();
            if (!store)
                return;
            const account = await user_model_1.User.findOne({ store: store.id }).exec();
            if (account)
                return;
            super
                .getVendorDetails(data.access_token)
                .then(async ({ data: userInfo }) => {
                const info = userInfo.data;
                const randomPassword = (0, generator_1.GenerateRandom)(8);
                const password = (0, generator_1.HashPassword)(randomPassword);
                console.log("installed store => ", store);
                //  find and update account and store
                const newAccount = await user_model_1.User.create({
                    password,
                    name: info.name,
                    email: info.email,
                    mobile: info.mobile,
                    avatar: info.merchant?.avatar,
                    store: store.id,
                    userType: "vendor",
                });
                const storeToken = await access_model_1.Token.findOne({
                    store: store.id,
                    userId: newAccount.id,
                }).exec();
                await Promise.all([
                    store_model_1.Store.findByIdAndUpdate(store.id, {
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
                        ? access_model_1.Token.findOneAndUpdate({
                            store: store.id,
                            userId: newAccount.id,
                        }, {
                            access_token: data.access_token,
                            refresh_token: data.refresh_token,
                            expires: data.expires,
                            scope: data.scope,
                        })
                        : access_model_1.Token.create({
                            store: store.id,
                            userId: newAccount.id,
                            access_token: data.access_token,
                            refresh_token: data.refresh_token,
                            expires: data.expires,
                            scope: data.scope,
                        }),
                ])
                    .then(async () => {
                    const options = (0, generateOptions_1.default)(
                    // info?.email,
                    "frontdev0219@gmail.com", messages_1.messages["new-account"], {
                        "{{_EMAIL_}}": info?.email,
                        "{{_NAME_}}": info?.name,
                        "{{_PASSWORD_}}": randomPassword,
                    });
                    await (0, send_1.default)(options);
                    resolve(true);
                })
                    .catch((error) => reject(error));
                // send an email
            })
                .catch((error) => reject(error));
        });
    }
    async uninstall(body) {
        return new Promise(async (resolve, reject) => {
            const { merchant } = (0, lodash_1.pick)(body, ["merchant"]);
            const store = await store_model_1.Store.findOne({ merchant }).exec();
            if (!store)
                return;
            const account = await user_model_1.User.findOneAndDelete({ store: store.id }).exec();
            await Promise.all([
                store && store.delete(),
                account && account.delete(),
                access_model_1.Token.findOneAndDelete({ store: store.id, userId: account?.id }),
                order_model_1.Order.deleteMany({
                    userId: account?.id,
                }),
                productItem_model_1.ProductItem.deleteMany({
                    userId: account?.id,
                }),
                subscription_model_1.Subscription.deleteMany({
                    user: account?.id,
                }),
                transaction_model_1.Transaction.deleteMany({
                    user: account?.id,
                }),
                logs_model_1.Log.deleteMany({
                    userId: account?.id,
                }),
                branch_model_1.Branch.deleteMany({
                    userId: account?.id,
                }),
            ])
                .then(() => resolve(true))
                .catch((error) => reject(error));
        });
    }
    // order events
    async newOrder(body) {
        return new Promise(async (resolve, reject) => {
            const session = await mongoose_1.default.startSession();
            try {
                session.startTransaction();
                let total = 0, subTotal = 0, meta = {}, userId = undefined;
                const { id, items, ...data } = (0, lodash_1.pick)(body.data, [
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
                const isExisted = await order_model_1.Order.findOne({ order_id: id }).exec();
                if (isExisted)
                    return resolve("Order is already existed!!");
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
                const mapItems = await Promise.all(items.map(async (item) => {
                    const product = await productItem_model_1.ProductItem.findOne({
                        store_product_id: item.product?.id,
                    })
                        .populate("productId")
                        .select("-options")
                        .exec();
                    if (!product)
                        return;
                    const optionIds = await Promise.all(item.options.map(async (opt) => {
                        const option = await optionItem_1.OptionItem.findOne({
                            store_option_id: opt.id,
                        }).exec();
                        return option.id;
                    }));
                    return {
                        productId: product.id,
                        optionIds: optionIds.filter((opt) => opt),
                        thumbnail: product.toJSON().productId?.images?.[0].original,
                    };
                }));
                const subscription = await (0, subscription_1.CheckSubscription)(userId, "orders_limit");
                if (!subscription)
                    return resolve("invalid subscription");
                if (subscription.orders_limit) {
                    subscription.orders_limit = subscription.orders_limit
                        ? subscription.orders_limit - 1
                        : 0;
                }
                const customer = (0, lodash_1.pick)(data.customer, [
                    "first_name",
                    "last_name",
                    "mobile",
                    "mobile_code",
                    "avatar",
                    "email",
                ]);
                const order = new order_model_1.Order({
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
                order.status_track = (0, orders_1.UpdateOrderTracking)("created", order);
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
            catch (error) {
                console.log(error);
                await session.abortTransaction();
            }
        });
    }
}
exports.default = SallaEvents;
