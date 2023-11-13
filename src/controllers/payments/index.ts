import dotenv from "dotenv";
dotenv.config();

import { NextFunction, Request, Response } from "express";
import { pick } from "lodash";
import ApiError from "../../errors/ApiError";
import { User } from "../../models/user.model";
import { Plan } from "../../models/plan.model";
import moment from "moment";
import { Transaction } from "../../models/transaction.model";
import { Subscription } from "../../models/subscription.model";
import { Order } from "../../models/order.model";
import {
  CollectShippingFee,
  CollectVATPrice,
  UnpaidPrices,
} from "../orders/features";
import {  UpdateSalaOrderStatus } from "../../features/salla/orders";
import { CheckTokenExpire } from "../../middlewares/authentication";
import TabPayment from "../../features/TabPayment";
import { Card } from "../../models/card.model";
import { UpdateOrderTracking } from "../orders";
import { PlaceOrder } from "../../features/aliExpress/features/PlaceOrder";

const TPayment = new TabPayment();

export async function CheckSubscriptionResult(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { reference, id, status } = pick(req.body, [
      "reference",
      "id",
      "status",
    ]);
    const chargeId = reference?.order.replace("ref-", "");

    const [userID, planId] = chargeId?.split("-");

    if (status !== "CAPTURED") return res.render("payment-error.ejs");

    const [user, plan] = await Promise.all([
      User.findById(userID).exec(),
      Plan.findById(planId).exec(),
    ]);

    if (!user) throw new ApiError("NotFound", "Invalid account");
    if (!plan) throw new ApiError("NotFound", "Selected plan is not available");

    const currentDate = moment().toDate();
    const nextPayment = moment()
      .add(1, plan.is_monthly ? "month" : "year")
      .toDate();

    const subscription = new Subscription({
      start_date: currentDate,
      expiry_date: nextPayment,
      plan: plan.id,
      user: user.id,
      orders_limit: plan.orders_limit,
      products_limit: plan.products_limit,
    });
    console.log(subscription)
    const transaction = new Transaction({
      status: status,
      tranRef: id,
      plan: plan.id,
      amount: plan.price,
      user: user?.id,
    });

    await Promise.all([
      Subscription.deleteMany({ user: user.id }),
      transaction.save(),
      subscription.save(),
    ]);

    res.render("payment-success.ejs");
  } catch (error) {
    console.log("error while updating user => \n", error);
    res.render("payment-error.ejs");
    next(error);
  }
}

export async function CheckOrderPayment(
  // POST:  api/v1/payments/callback/pay-order
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { reference, id, status, description } = pick(req.body, [
      "reference",
      "id",
      "status",
      "description",
    ]);

    const chargeId = reference?.order.replace("ref-", "");

    const [userID, orderId] = chargeId?.split("-");

    // const transactionResults = await session.withTransaction(
    //   async () => {

    if (status !== "CAPTURED") return res.end();

    const [user, order] = await Promise.all([
      User.findById(userID).exec(),
      Order.findById(orderId).exec(),
    ]);

    if (!user) throw new ApiError("NotFound", "Invalid account");
    if (!order)
      throw new ApiError("NotFound", "Selected order is not available");
    const orderData = order.toJSON()
    const amount = await UnpaidPrices([order]);
    const totalAmountWithVat = CollectVATPrice(amount);
    // total amount with VAT + SHIPPING
    const totalUnpaidAmount = totalAmountWithVat + orderData.shippingFee;
    console.log("TOTAL UNPAID AMOUNT: ", totalUnpaidAmount);
    const transaction = new Transaction({
      status,
      tranRef: id,
      user: user?.id || userID,
      order: order?.id || orderId,
      amount: totalUnpaidAmount,
    });

    const status_track = UpdateOrderTracking("in_review", order);

    order.status = "in_review";
    order.status_track = status_track;
    order.notes = description;

    // const tokens = user?.tokens;
    // const access_token = CheckTokenExpire(tokens);

    // await UpdateSalaOrderStatus("in_progress", order.order_id, access_token).catch(
    //   (err) => {
    //     console.log(err.response.data);
    //   }
    // );
    // await CreateAliExpressOrder({ ...req.body, id: orderId }); // create new order
    await Promise.all([order.save(), transaction.save()]);

    // res.render("payment-success.ejs");
    res.end();
  } catch (error) {
    console.log("error while updating order => \n", error);
    // res.render("payment-error.ejs");
    next(error);
  }
}

export async function CreateCustomer(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = pick(req.body, ["id"]);
    const account = await User.findById(id).exec();

    if (!account) throw new ApiError("NotFound", "Account is invalid");
    TPayment.CreateCustomer({
      first_name: account?.name?.split(/\s/gi)?.[0],
      last_name: account?.name?.split(/\s/gi)?.[1],
      email: account?.email,
      metadata: {
        account_id: account?.id,
      },
    })
      .then(async ({ data }) => {
        account.pt_customer_id = data.id;
        await account.save();
        res.json({ message: "Feature enabled successfully!" });
      })
      .catch((err) => {
        console.log(err);
        return next(new ApiError("ServiceUnavailable", err?.message));
      });
  } catch (error) {
    next(error);
  }
}

export async function GetChargeDetails(
  // GET: api/payments/callback/pay-order
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { tap_id } = pick(req.query, ["tap_id"]);
    if (!tap_id || !/^chg_/gi.test(tap_id))
      return res.render("payment-error.ejs");
    TPayment.GetChargeDetails(tap_id)
      .then(async({ data }) => {
          if (data.status !== "CAPTURED") return res.render("payment-error.ejs");
          if(data?.metadata?.orderId){
            await Order.findByIdAndUpdate(data?.metadata?.orderId,{paid:true}).then(async(order)=> {
              await PlaceOrder(order)
            })
          }else {
            const { reference, id, status } = pick(data, [
              "reference",
              "id",
              "status",
            ]);
            const chargeId = reference?.order.replace("ref-", "");
            const [userID, planId] = chargeId?.split("-");
        
            if (status !== "CAPTURED") return res.render("payment-error.ejs");
        
            const [user, plan] = await Promise.all([
              User.findById(userID).exec(),
              Plan.findById(planId).exec(),
            ]);
        
            if (!user) throw new ApiError("NotFound", "Invalid account");
            if (!plan) throw new ApiError("NotFound", "Selected plan is not available");
        
            const currentDate = moment().toDate();
            const nextPayment = moment()
              .add(1, plan.is_monthly ? "month" : "year")
              .toDate();
        
            const subscription = new Subscription({
              start_date: currentDate,
              expiry_date: nextPayment,
              plan: plan.id,
              user: user.id,
              orders_limit: plan.orders_limit,
              products_limit: plan.products_limit,
            });
            console.log(subscription)
            const transaction = new Transaction({
              status: status,
              tranRef: id,
              plan: plan.id,
              amount: plan.price,
              user: user?.id,
            });
        
            await Promise.all([
              Subscription.deleteMany({ user: user.id }),
              transaction.save(),
              subscription.save(),
            ]);
          }
      }).then(()=>res.render("payment-success.ejs"))
      .catch((error) => {
        console.log(error)
        return res.render("payment-error.ejs");
      });
  } catch (error) {
    console.log(error)
    res.render("payment-error.ejs");
  }
}
export async function GetInvoiceDetails(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { tap_id } = pick(req.query, ["tap_id"]);

    if (!tap_id || !/^inv_/gi.test(tap_id))
      return res.render("payment-error.ejs");
    TPayment.GetInvoiceDetails(tap_id)
      .then(({ data }) => {
        console.log('invoice=>' + data)
        if (data.status !== "PAID") return res.render("payment-error.ejs");

        return res.render("payment-success.ejs");
      })
      .catch((error) => {
        console.log(error);
        return res.render("payment-error.ejs");
      });
  } catch (error) {
    res.render("payment-error.ejs");
  }
}
