"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const orders_1 = require("../../controllers/orders");
const subscription_1 = require("../../controllers/subscription");
const generateOptions_1 = __importDefault(require("../../features/email/generateOptions"));
const send_1 = __importDefault(require("../../features/email/send"));
const generator_1 = require("../../features/generator");
const jwt_1 = require("../../features/jwt");
const request_1 = __importDefault(require("../../features/salla/request"));
const order_model_1 = require("../../models/order.model");
const product_model_1 = require("../../models/product.model");
const user_model_1 = require("../../models/user.model");
const messages_1 = require("../../responses/messages");
class SallaEvents {
    async CreateNewApp(body, req, next) {
        try {
            const { merchant, data } = (0, lodash_1.pick)(body, ["merchant", "data"]);
            const existed = await user_model_1.User.findOne({ merchantId: merchant }).exec();
            if (existed)
                return;
            const user = new user_model_1.User({
                name: data.app_name,
                merchantId: merchant,
                meta: JSON.stringify(data),
                storeName: data.app_name,
                userType: "vendor",
            });
            user.save(function (err, result) {
                if (err)
                    return console.log(err);
                next();
            });
        }
        catch (error) {
            next(error);
        }
    }
    async AuthorizeEvent(body, req, next) {
        try {
            let password, hashed, token;
            const { merchant, data } = (0, lodash_1.pick)(body, ["merchant", "data"]);
            const account = await user_model_1.User.findOne({
                merchantId: merchant,
                tokens: {
                    $eq: null,
                },
            }).exec();
            if (!account)
                return;
            const { data: info } = await this.GetUserInfo(data.access_token);
            const { data: userInfo } = info;
            password = (0, generator_1.GenerateRandom)(16);
            hashed = (0, generator_1.HashPassword)(password);
            token = (0, jwt_1.GenerateToken)({
                merchant,
                token: JSON.stringify(data),
            });
            user_model_1.User.findOneAndUpdate({
                merchantId: merchant,
                tokens: {
                    $eq: null,
                },
            }, {
                password: hashed,
                name: userInfo?.name,
                email: userInfo?.email,
                mobile: userInfo?.mobile,
                userInfo: JSON.stringify(userInfo?.merchant),
                avatar: userInfo?.merchant?.avatar,
                website: userInfo?.merchant?.domain,
                tokens: JSON.stringify(data),
            }, { new: true }, async function (err, result) {
                if (userInfo?.email) {
                    // send email to new partner with email and new password
                    const options = (0, generateOptions_1.default)(userInfo?.email, 
                    // "frontdev0219@gmail.com",
                    // process.env.EMAIL_USERNAME,
                    messages_1.messages["new-account"], {
                        "{{_EMAIL_}}": userInfo?.email,
                        "{{_NAME_}}": userInfo?.name,
                        "{{_PASSWORD_}}": password,
                    });
                    await (0, send_1.default)(options);
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    RemoveApp(body, req, next) {
        try {
            const { merchant } = (0, lodash_1.pick)(body, ["merchant"]);
            user_model_1.User.findOneAndDelete({
                merchantId: merchant,
            }, {}, function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("uninstall app: ", result);
            });
        }
        catch (error) {
            next(error);
        }
    }
    GetUserInfo(token) {
        return (0, request_1.default)({ url: "oauth2/user/info", method: "get", token });
    }
    DeleteSelectedProduct(body, req, next) {
        try {
            const { id } = (0, lodash_1.pick)(body.data, ["id"]);
            product_model_1.Product.findOneAndDelete({
                store_product_id: id,
            }, {}, function (err, result) {
                if (err)
                    return console.log(err);
                // console.log(result);
            });
        }
        catch (error) {
            next(error);
        }
    }
    DeleteSelectedOrder(body, req, next) {
        try {
            const { id } = (0, lodash_1.pick)(body.data, ["id"]);
            order_model_1.Order.findOneAndDelete({
                order_id: id,
            }, {}, function (err, result) {
                if (err)
                    console.log(err);
                if (!result)
                    console.log(result);
            });
        }
        catch (error) {
            next(error);
        }
    }
    async CreateNewOrder(body, res, next) {
        try {
            let total = 0, sub_total = 0, commission = 0, meta = {};
            const { data: orderData } = (0, lodash_1.pick)(body, ["data"]);
            const data = (0, lodash_1.pick)(orderData, [
                "payment_method",
                "id",
                "order_id",
                "reference_id",
                "items",
                "shipping",
                "customer",
                "status",
            ]);
            const orderExisted = await order_model_1.Order.findOne({ order_id: data.id }).exec();
            if (orderExisted)
                return;
            const itemIds = (0, lodash_1.map)(data.items, "product.id");
            const products = await product_model_1.Product.find({
                store_product_id: {
                    $in: itemIds,
                },
            })
                .select("name store_product_id price main_price vendor_commission vendor_price merchant")
                .exec();
            if (!products?.length)
                return;
            const findProductIds = (0, lodash_1.map)(products, "store_product_id");
            const filterItems = data.items?.filter((obj) => {
                return findProductIds.includes(obj?.product?.id?.toString());
            });
            const mapItems = await Promise.all(filterItems.map((item) => {
                const productId = item?.product?.id;
                const product = products.find((ev) => ev.store_product_id == productId);
                const values = new Array().concat(...(product?.options?.map((e) => e.values) || []));
                const options = item.options?.map((option) => {
                    const findValue = values.find((e) => e.store_value_id == option?.value?.id);
                    if (!findValue)
                        return option;
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
            }));
            // commission = Math.ceil((+sub_total * +(APP_COMMISSION as string)) / 100);
            // total = +sub_total + commission;
            total = +sub_total;
            const merchant = products?.[0]?.merchant;
            const subscription = await (0, subscription_1.CheckSubscription)(merchant, "orders_limit");
            if (subscription.orders_limit)
                subscription.orders_limit = subscription.orders_limit - 1;
            const order = new order_model_1.Order({
                ...data,
                amounts: {
                    total: {
                        amount: total,
                    },
                },
                meta,
                merchant,
                order_id: data.id,
                items: mapItems,
                status: "created",
                status_track: [],
            });
            const status_track = (0, orders_1.UpdateOrderTracking)("created", order);
            order.status_track = status_track;
            console.log("New order", order);
            await Promise.all([
                subscription.save(),
                order.save(function (err, result) {
                    if (err)
                        return console.log(err);
                    console.log(result);
                }),
            ]);
            return res.status(200).send("order stored");
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async UpdateOrderStatus(body, res, next) {
        try {
            const { id } = (0, lodash_1.pick)(body.data, ["id"]);
            console.log("order id to update status => ", id);
            const order = await order_model_1.Order.findOne({ order_id: id }).exec();
            // console.log("order body status =>", body);
            if (!order)
                return console.log("selected order is invalid!");
            next();
        }
        catch (error) { }
    }
}
exports.default = SallaEvents;
