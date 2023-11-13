import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { pick } from "lodash";
import { Plan } from "../../models/plan.model";
import ApiError from "../../errors/ApiError";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../../models/user.model";
import { Subscription } from "../../models/subscription.model";
import moment from "moment";
import TabPayment from "../../features/TabPayment";
import { AxiosError } from "axios";
import ModelFactor from "../../features/ModelsFactor";
import { Transaction } from "../../models/transaction.model";
import GenerateLocation from "../../features/GenerateLocation";
dotenv.config();

const TPayment = new TabPayment();

const { LOCAL_HTTP_WEBSOCKET } = process.env;

export async function CreatePlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // let total: number = 0;
    const {
      discount_type,
      discount_value = 0,
      price = 0,
      description,
      is_default,
      orders_limit,
      products_limit,
      name,
      ...data
    } = pick(req.body, [
      "name",
      "description",
      "discount_type",
      "discount_value",
      "orders_limit",
      "products_limit",
      "services",
      "price",
      "is_default",
      "is_monthly",
    ]);

    const default_plan_values = {
      name,
      description,
      is_default,
      orders_limit,
      products_limit,
      services: ["ae_salla"],
    };

    const pricing_values = {
      ...data,
      discount_type,
      discount_value,
      description,
      is_default,
      orders_limit,
      products_limit,
      name,
      price,
      services: ["ae_salla"],
    };

    const plan = new Plan(is_default ? default_plan_values : pricing_values);
    const anotherPlan = await Plan.findOne({ is_default: true }).exec();

    if (anotherPlan && is_default)
      throw new ApiError("UnprocessableEntity", {
        is_default:
          "There is another plan with default value, only one plan can set as default.",
      });

    if (!is_default) {
      if (discount_type === "fixed") {
        // total = parseFloat((+price - +discount_value).toFixed(2)) || 0;
        plan.discount_price = discount_value;
      } else if (discount_type === "percentage") {
        const percentValue = parseFloat(
          ((+price * +discount_value) / 100).toFixed(2)
        );

        plan.discount_price = +percentValue;

        // total = parseFloat((+price - +percentValue).toFixed(2)) || 0;
      }
    }

    plan.save(async function (err: any, result: any) {
      if (err)
        return next(
          new ApiError(
            "InternalServerError",
            "Cannot create a new plan at that moment"
          )
        );

      res.json({ message: "Plan created successfully", result });
    });
  } catch (error) {
    next(error);
  }
}

export async function UpdatePlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let total: number = 0;
    const {
      discount_type,
      discount_value = 0,
      price = 0,
      description,
      is_default,
      orders_limit,
      products_limit,
      name,
      id,
      ...data
    } = pick(req.body, [
      "name",
      "description",
      "discount_type",
      "discount_value",
      "orders_limit",
      "products_limit",
      "services",
      "price",
      "is_default",
      "is_monthly",
      "id",
    ]);

    const default_plan_values = {
      name,
      description,
      is_default,
      orders_limit,
      products_limit,
      services: ["ae_salla"],
    };

    const pricing_values = {
      ...data,
      discount_type,
      discount_value,
      description,
      is_default,
      orders_limit,
      products_limit,
      name,
      price,
      services: ["ae_salla"],
    };

    const plan = await Plan.findById(id).exec();

    if (!plan) throw new ApiError("NotFound", "Selected plan is invalid");

    const anotherPlan = await Plan.findOne({
      is_default: true,
      _id: {
        $ne: id,
      },
    }).exec();

    if (anotherPlan && is_default)
      throw new ApiError("UnprocessableEntity", {
        is_default:
          "There is another plan with default value, only one plan can set as default.",
      });

    if (!is_default) {
      if (discount_type === "fixed") {
        // total = parseFloat((+price - +discount_value).toFixed(2)) || 0;
        plan.discount_price = discount_value;
      } else if (discount_type === "percentage") {
        const percentValue = parseFloat(
          ((+price * +discount_value) / 100).toFixed(2)
        );

        plan.discount_price = +percentValue;

        // total = parseFloat((+price - +percentValue).toFixed(2)) || 0;
      }

      // plan.price = total;
    }

    plan.save(async function (err: any, result: any) {
      if (err)
        return next(
          new ApiError(
            "InternalServerError",
            "Cannot update selected plan at that moment, try again later"
          )
        );

      await Plan.findByIdAndUpdate(
        id,
        {
          $set: is_default ? default_plan_values : pricing_values,
        },
        { new: true }
      );

      res.json({ message: "Plan updated successfully", result });
    });
  } catch (error) {
    next(error);
  }
}

export async function GetAllPlans(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, search_key } = pick(req.query, ["page", "search_key"]);

    const plans = page
      ? await ModelFactor(Plan, { page, search_key }, {})
      : await Plan.find({});

    res.json(plans);
  } catch (error) {
    next(error);
  }
}

export async function GetSelectedPlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = pick(req.params, ["id"]);

    if (!id || !isValidObjectId(id))
      throw new ApiError("NotFound", "Invalid item");

    const plan = await Plan.findById(id).exec();

    if (!plan) throw new ApiError("NotFound", "Item not found");

    res.json({ plan });
  } catch (error) {
    next(error);
  }
}

export async function CreatePaymentToSubscribe(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = pick(req.body, ["id"]);
    const { user_id } = pick(req.local, ["user_id", "userType"]);
    const data = await GenerateChargePayment(req, id, user_id);
    res.json(data);

    // .catch((error: AxiosError | any) => {
    //   const err = error.response;
    //   return next(new ApiError("InternalServerError", ));
    // });
  } catch (error) {
    next(error);
  }
}

export async function Resubscribe(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { user_id } = pick(req.local, ["user_id"]);
    const subscription = await Subscription.findOne({ user: user_id })
      .populate(["user", "plan"])
      .exec();

    if (!subscription)
      throw new ApiError(
        "UnprocessableEntity",
        "You do not have any subscription available, please select one of our awesome plans first"
      );

    const { plan } = subscription.toJSON();

    const currentDate = moment().toDate();
    const nextPayment = moment()
      .add(1, plan.is_monthly ? "month" : "year")
      .toDate();

    subscription.start_date = currentDate;
    subscription.expiry_date = nextPayment;
    subscription.orders_limit = plan.orders_limit;
    subscription.products_limit = plan.products_limit;

    await subscription.save();

    return res.json({ message: "Your plan has been upgraded successfully!!" });
  } catch (error) {
    next(error);
  }
}

export async function GetAllSubscriptions(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, search_key } = pick(req.query, ["page", "search_key"]);

    const subscriptions = await ModelFactor(
      Subscription,
      {
        page,
        search_key,
        populate: [
          {
            path: "user",
            select: "name email avatar mobile",
          },

          "plan",
        ],
      },
      {}
    );

    res.json(subscriptions);
  } catch (error) {
    console.log("pagination error => ", error);
    next(error);
  }
}

export async function GetPlanAndVendorTransactions(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { plan } = pick(req.body, ["plan"]);
    const { user } = pick(req.params, ["user"]);

    if (!isValidObjectId(user) || !isValidObjectId(plan))
      throw new ApiError("UnprocessableEntity", "Invalid user or plan");

    const transactions = await Transaction.find({ user, plan })
      .populate(["plan"])
      .exec();

    res.json(transactions);
  } catch (error) {
    console.log("pagination error => ", error);
    next(error);
  }
}

export async function DeletePlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = pick(req.params, ["id"]);
    if (!isValidObjectId(id))
      throw new ApiError("UnprocessableEntity", "Invalid plan");

    const plan = await Plan.findById(id).exec();
    if (!plan) throw new ApiError("UnprocessableEntity", "Plan not found");

    const subscriptions = await Subscription.countDocuments({
      plan: id,
    }).exec();

    if (subscriptions >= 1)
      throw new ApiError(
        "UnprocessableEntity",
        "There are some subscriptions are related to this plan so you cannot delete it."
      );

    await plan.delete();
    res.json({ message: "Plan deleted successfully!" });
  } catch (error) {
    next(error);
  }
}

// added new
function GenerateChargePayment(req: Request, id: string, user_id: string) {
  return new Promise(async (resolve, reject) => {
    const location = GenerateLocation(req);
    const route = "/v1/payments/callback/pay-order";

    const [user, plan] = await Promise.all([
      User.findById(user_id).exec(),
      Plan.findById(id).exec(),
    ]);

    if (!user) return reject(new ApiError("NotFound", "Invalid account"));
    if (!plan)
      return reject(new ApiError("NotFound", "Selected plan is not available"));
    if (plan.is_default)
      return reject(
        new ApiError(
          "UnprocessableEntity",
          "You cannot subscribe with default plan."
        )
      );

    const generateId = [user.id, plan.id].join("-");

    const customerSendToPayment = {
      first_name: user.name,
      email: user.email,
    };

    TPayment.CreateCharge({
      currency: "SAR",
      customer: customerSendToPayment,
      order: {
        amount: plan.price,
        items: [
          {
            amount: plan.price,
            currency: "SAR",
            name: plan.name,
            quantity: 1,
          },
        ],
      },
      post: location + route,
      redirect: location + route,
      ref_order: "ref-" + generateId,
      source: undefined,
      amount: 0,
    })
      .then(({ data }) => {
        resolve({ url: data.transaction.url });
      })
      .catch((error: AxiosError | any) => {
        const err = error?.response?.data;

        reject(err || error);
      });
  });
}
// end.....

function XGenerateSubscriptionInvoice(
  req: Request,
  id: string,
  user_id: string
) {
  return new Promise(async (resolve, reject) => {
    const location = GenerateLocation(req);
    const route = "/api/v1/payments/callback/subscriptions";

    const [user, plan] = await Promise.all([
      User.findById(user_id).exec(),
      Plan.findById(id).exec(),
    ]);

    if (!user) return reject(new ApiError("NotFound", "Invalid account"));
    if (!plan)
      return reject(new ApiError("NotFound", "Selected plan is not available"));
    if (plan.is_default)
      return reject(
        new ApiError(
          "UnprocessableEntity",
          "You cannot subscribe with default plan."
        )
      );

    const generateId = [user.id, plan.id].join("-");

    TPayment.CreateInvoice({
      draft: false,
      due: moment().add(1, "days").toDate().getTime(),
      expiry: moment().add(2, "days").toDate().getTime(),
      mode: "INVOICEPAY",
      customer: user.pt_customer_id,
      order: {
        amount: plan.price,
        items: [
          {
            amount: plan.price,
            currency: "SAR",
            name: plan.name,
            quantity: 1,
          },
        ],
      },
      post: location + route,
      redirect: location + route,
      ref_invoice: "inv-" + generateId,
      ref_order: "ref-" + generateId,
    })
      .then(({ data }) => {
        resolve({ url: data.url });
      })
      .catch((error: AxiosError | any) => {
        const err = error?.response?.data;

        reject(err || error);
      });
  });
}
