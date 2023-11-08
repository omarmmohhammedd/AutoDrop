import { NextFunction, Response, Request } from "express";
import { map, pick } from "lodash";
import ApiError from "../../errors/ApiError";
import { Product } from "../../models/product.model";
import { Order, OrderDocument } from "../../models/order.model";
import moment from "moment";
import {
  CollectEarnings,
  CollectVATPrice,
  UnpaidPrices,
} from "../orders/features";
import { User } from "../../models/user.model";
import { Subscription } from "../../models/subscription.model";
import { Transaction } from "../../models/transaction.model";
import fs from "fs";
import path from "path";
import { Setting } from "../../models/settings.model";

const settingsData = {
  faqs: [
    {
      question_en: "What are the supported platforms for connectivity?",
      question_ar: "ما هي المنصات المدعومة للربط ؟",
      answer_en: "offline salla platform.",
      answer_ar: "منصة سلة حاليا.",
    },
    {
      question_en: "What are the supported sites for linking with stores?",
      question_ar: "ما هي المواقع المدعومة للربط مع المتاجر ؟",
      answer_en: "Ali Express website now.",
      answer_ar: "موقع علي اكسبريس حاليا.",
    },
    {
      question_en: "Is linking to other platforms available in the future?",
      question_ar: "هل يتوفر ربط منصات أخري مستقبلا ؟",
      answer_en: "Yes, soon other platforms will be supported.",
      answer_ar: "نعم ، قريبا سيتم دعم منصات أخري.",
    },
  ],
  termsOfUses: {
    title_en: "Terms of uses",
    title_ar: "",
    content_en: "",
    content_ar: "",
  },
  policyAndPrivacy: {
    title_en: "Policy and privacy",
    title_ar: "",
    content_en: "",
    content_ar: "",
  },
};

export async function GetDashboard(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { userType, user_id } = pick(req.local, ["userType", "user_id"]);
    let result: any;

    if (userType === "vendor") {
      result = await GetVendorSummary(user_id, userType);
    } else {
      result = await GetAdminSummary();
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function GetVendorSummary(user_id: string, userType: string) {
  return new Promise(async (resolve, reject) => {
    const today = moment().startOf("day").toDate();

    const [products, recent_orders, orders, total_products] = await Promise.all(
      [
        Product.find({
          merchant: user_id,
          createdAt: {
            $gte: today,
          },
        }).select("name images price main_price items"),
        Order.find({
          ...(userType === "vendor" ? { merchant: user_id } : {}),
          createdAt: {
            $gte: today,
          },
        }).select("amounts status createdAt order_id items meta"),
        Order.find({
          ...(userType === "vendor" ? { merchant: user_id } : {}),
        }).select("amounts status createdAt order_id items meta"),
        Product.countDocuments({
          merchant: user_id,
        }),
      ]
    );

    const incompleteOrders: OrderDocument[] = orders?.filter(
      (order: OrderDocument) => order.status !== "created" && order.status !=='completed' && order.status !== 'canceled'
    );

    const createdOrders: OrderDocument[] = orders?.filter(
      (order: OrderDocument) => order.status === "created"
    );

    const completedOrders: OrderDocument[] = orders?.filter(
      (order: OrderDocument) => order.status === "completed"
    );

    const suspended_earnings = await CollectEarnings(
      incompleteOrders,
      userType
    );
    const unpaid_amount = await UnpaidPrices(createdOrders);
    const unpaid_amount_from_vat =
      CollectVATPrice(unpaid_amount) + createdOrders?.length * 24;

    const result = {
      products,
      orders: recent_orders,
      date: today,
      summary: {
        suspended_earnings,
        unpaid_amount: unpaid_amount_from_vat,
        total_products,
      },
    };

    resolve(result);
  });
}

async function GetAdminSummary() {
  return new Promise(async (resolve, reject) => {
    let result: any,
      total_transactions: number = 0;
    const today = moment().startOf("day").toDate();

    const [
      total_vendors,
      available_subscriptions,
      expired_subscriptions,
      secure_vendors,
      transactions,
      products,
      total_products,
    ] = await Promise.all([
      User.countDocuments({ userType: "vendor" }),
      Subscription.countDocuments(),
      Subscription.countDocuments({
        expiry_date: {
          $lt: new Date(),
        },
      }),
      User.countDocuments({
        pt_customer_id: { $ne: null },
        userType: "vendor",
      }),
      Transaction.find({
        plan: {
          $ne: null,
        },
      }).populate("plan"),
      Product.find({
        createdAt: {
          $gte: today,
        },
      }).select("name images price main_price items"),
      Product.countDocuments(),
    ]);

    await Promise.all(
      transactions.map((e) => {
        const item = e.toJSON();
        total_transactions += Number(item.plan.price) || 0;
      })
    );

    result = {
      products,
      summary: {
        total_vendors,
        available_subscriptions,
        expired_subscriptions,
        secure_vendors,
        total_transactions,
        total_products,
      },
    };

    resolve(result);
  });
}

export async function GetServerKeys(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const settings = await Setting.find();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function UpdateServerKeys(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { settings: data } = pick(req.body, ["settings"]);
    const settings = await Promise.all(
      data.map(({ id, ...other }: any) =>
        Setting.findByIdAndUpdate(id, { $set: other }, { new: true })
      )
    );

    res.json({ message: "Settings updated successfully!" });
  } catch (error) {
    next(error);
  }
}

export async function GetStaticSettings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filename = "index.json";
    const filepath = path.join(__dirname, "../..", "static");
    const isExisted = fs.existsSync(filepath);

    if (!isExisted) {
      fs.mkdirSync(filepath, { recursive: true });
      fs.writeFileSync(
        path.join(filepath, filename),
        JSON.stringify(settingsData, null, 2)
      );
    }

    const file = fs.readFileSync(path.join(filepath, filename), {
      encoding: "utf-8",
    });

    res.json({ settings: JSON.parse(file) });
  } catch (error) {
    next(error);
  }
}


export const urlToken = (req:Request,res:Response)=>{
  const redirect_uri = process.env.LOCAL_HTTP_WEBSOCKET
  const Ali_Key = process.env.ALI_APP_KEY
  res.json({url:`https://api-sg.aliexpress.com/oauth/authorize?response_type=code&&force_auth=true&redirect_uri=${redirect_uri}&client_id=${Ali_Key}`})
}