import { Product } from "../../../models/product.model";
import { Order } from "../../../models/order.model";
import { NextFunction, Response } from "express";
import { map, parseInt, pick } from "lodash";
import SallaRequest from "../request";
import findSettingKey from "../../settings";

export async function CreateNewOrder(
  body: any,
  res: Response,
  next: NextFunction
) {
  try {
    let total: number = 0,
      sub_total: number = 0,
      commission: number = 0;
    // const { APP_COMMISSION } = process.env;
    // const APP_COMMISSION = await findSettingKey("APP_COMMISSION");
    const { data } = pick(body, ["data"]);

    const itemIds = map(data.items, "product.id");

    const products: any[] | null = await Product.find({
      salla_product_id: {
        $in: itemIds,
      },
    }).exec();

    if (!(products as any[])?.length) return;

    const findProductIds = map(products, "salla_product_id");
    const filterItems = data.items?.filter((obj: any) => {
      return findProductIds.includes(obj?.product?.id?.toString());
    });

    for (const item of filterItems) {
      sub_total += parseFloat(item?.amounts?.total?.amount) || 0;
    }

    total = +sub_total + commission;

    const order = new Order({
      ...data,
      amounts: {
        total: {
          amount: total,
        },
      },
      merchant: products?.[0]?.merchant,
      order_id: data.id,
      items: filterItems,
      status: "created",
    });

    order.save(function (err, result) {
      if (err) return console.log(err);
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export type SallaOrderStatus =
  | "payment_pending"
  | "under_review"
  | "in_progress"
  | "completed"
  | "delivering"
  | "delivered"
  | "shipped"
  | "canceled"
  | "restoring"
  | "restored";

export async function UpdateSalaOrderStatus(
  status: SallaOrderStatus,
  order_id: string,
  token: string
) {
  const URL = "orders/" + order_id + "/status";

  return SallaRequest({
    url: URL,
    method: "post",
    data: { slug: status },
    token,
  });
}

export const getCities = async(req:any,res:Response)=>{

  try {
    
    let counter = 15
    let Cities = []
    while (counter>0){
      let data = await SallaRequest({
        url:'https://api.salla.dev/admin/v2/countries/1473353380/cities',
        method:'get',
        token:req.local.access_token,
        data:{
          page:counter
        }
      })
      Cities.push(...data.data.data)
      counter -=1
    }
    res.json({Cities})

  }
   catch (error) {
    console.log(error)
  }

}
