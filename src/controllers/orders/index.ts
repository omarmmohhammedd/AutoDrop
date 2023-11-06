import { NextFunction, Response, Request } from "express";
import {
  Order,
  OrderDocument,
  StatusType,
  StatusTrack,
} from "../../models/order.model";
import { pick } from "lodash";
import ApiError from "../../errors/ApiError";
import { PlaceOrder } from "../../features/aliExpress/features/PlaceOrder";
import { CollectVATPrice, UnpaidPrices } from "./features";
import mongoose from "mongoose";
import { User } from "../../models/user.model";
import { PayTabPayment } from "../../features/payments";
import {
  UpdateSalaOrderStatus as UpdateSallaStatus,
  SallaOrderStatus,
} from "../../features/salla/orders/index";
import { CheckTokenExpire } from "../../middlewares/authentication";
import { Transaction } from "../../models/transaction.model";
import { isValidObjectId } from "mongoose";
import ModelFactor from "../../features/ModelsFactor";
import GenerateLocation from "../../features/GenerateLocation";
import TabPayment from "../../features/TabPayment";
import { Product } from "../../models/product.model";

const PTPayment = new PayTabPayment();
const TPayment = new TabPayment();

const {
  PT_REFUND_FEES,
  PT_TRANS_FEES,
  LOCAL_HTTP_WEBSOCKET,
  TAB_TAX,
  TAB_ORDERS_TAX,
} = process.env;

export async function GetAllOrders(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { user_id, userType } = pick(req.local, [
      "user_id",
      "merchant",
      "userType",
    ]);
    const { page, search_key } = pick(req.query, ["page", "search_key"]);
    const orders = await ModelFactor(
      Order,
      { page, search_key },
      { ...(userType === "vendor" && { merchant: user_id }) }
    );

    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function GetSelectedOrder(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { user_id } = pick(req.local, ["user_id"]);
    const { id } = pick(req.params, ["id"]);
    if (!isValidObjectId(id))
      throw new ApiError("UnprocessableEntity", "Invalid item");

    const order = await Order.findById(id).exec();

    if (!order) throw new ApiError("NotFound", "Selected order is invalid");

    const unpaidAmount = await UnpaidPrices([order]);
    const amountWithVat = CollectVATPrice(unpaidAmount);
    res.json({
      order,
      unpaid_amount: unpaidAmount,
      amount_included_vat:order.shippingFee ?amountWithVat + ((Number(order.shippingFee) * (Number(TAB_ORDERS_TAX || 0) /100))) :  amountWithVat,
      vat_value: Number(TAB_ORDERS_TAX || 0),
      shippingFee: order.shippingFee,
    });
  } catch (error) {
    next(error);
  }
}

export async function DeleteOrder(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { user_id } = pick(req.local, ["user_id"]);
    const { id } = pick(req.body, ["id"]);

    Order.findOneAndDelete(
      {
        _id: id,
        merchant: user_id,
      },
      {},
      function (err, result) {
        if (err)
          return next(
            new ApiError(
              "InternalServerError",
              "Something went wrong while deleting selected order"
            )
          );

        if (!result) return next(new ApiError("NotFound", "Item not found"));

        res.json({ message: "Selected order deleted successfully" });
      }
    );
  } catch (error) {
    next(error);
  }
}

export async function CreateAliExpressOrder(body: any) {
  return new Promise(async (resolve, reject) => {
    try {
      const { id, tranRef, cartId } = pick(body, ["id", "tranRef", "cartId"]);


      const order: OrderDocument | null = await Order.findById(id).exec();

      if (!order) throw new ApiError("NotFound", "Invalid order");

      const { response: result, data }: any = await PlaceOrder(order);
      const amount = await UnpaidPrices([order]);

      if (!result.is_success) {
        const refundResult = await PTPayment.CreateTransaction(
          "refund",
          cartId,
          tranRef,
          amount,
          "Order has been not sent to system"
        );

        console.log("refund result =>", refundResult.data);
        console.log("place order result =>", result);
        return reject(
          new ApiError(
            "ServiceUnavailable",
            // data
            result?.msg ||
              "Cannot send this request at that moment, try again later"
          )
        );
      }
      // find and update order status
      await Order.findByIdAndUpdate(
        id,
        {
          $set: {
            status: "in_transit",
          },
        },
        { new: true }
      );

      console.log("Order status updated =>", id);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}

export async function CreatePaymentToSubscribe(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const location = GenerateLocation(req);
    const route = "/v1/payments/callback/pay-order";

    const { id, notes } = pick(req.body, ["id", "notes"]);
    const { user_id } = pick(req.local, ["user_id", "userType"]);

    const [user, order] = await Promise.all([
      User.findById(user_id).exec(),
      Order.findById(id).exec(),
    ]);
    if (!user) throw new ApiError("NotFound", "Invalid account");
    if (!order)
      throw new ApiError("NotFound", "Selected order is not available");
      const orderJSON = order.toJSON();
    if(
      !orderJSON?.customer.first_name ||
       !orderJSON?.customer.middle_name ||
        !orderJSON?.customer.last_name || 
        !orderJSON?.customer.mobile
        ) {
          throw new ApiError("409",'Complete Customer Details First')
        }

    if(
      !orderJSON.shipping.address.country || 
      !orderJSON.shipping.address.city_en || 
      !orderJSON.shipping.address.postal_code || 
      !orderJSON.shipping.address.province_en || 
      !orderJSON.shipping.address.street_en || 
      !orderJSON.shipping.address.district_en 
      ) throw new ApiError("409",'Complete Shipping Address First')

    const shippingFee = orderJSON.shippingFee
    if(!shippingFee) throw new ApiError("409",'Complete Products Shipping First')

    if(orderJSON.paid) throw new ApiError("409",'This Order Has Been Paid Before ')
    const generateId = [user.id, order.id].join("-");
      await Order.findByIdAndUpdate(id,{$set:{'notes':notes}})
    const unpaidAmount = await UnpaidPrices([order]);
    const orderAmountWithVat =order.shippingFee ? CollectVATPrice(unpaidAmount)  + ((Number(order.shippingFee) * (Number(TAB_ORDERS_TAX || 0) /100))) : CollectVATPrice(unpaidAmount)
    const vatAmount = parseFloat(
      (orderAmountWithVat - unpaidAmount).toFixed(2)
    );

    // total order amount Shipping + VAT
    const orderTotalAmount = orderAmountWithVat + shippingFee;
   
    const items = orderJSON.items?.map((item: any) => {
      const productID = item?.product?.id;
      const quantity = item?.quantity;
      const meta = orderJSON.meta;
      const productVendorPrice =
        Number(meta[productID]?.vendor_price || 0) * quantity;
      const productPrice = Number(item?.product?.price?.amount || 0);
      const amount = parseFloat((productPrice - productVendorPrice).toFixed(2));
      return {
        amount,
        currency: "SAR",
        name: item?.product?.name,
        quantity,
        image: item?.product?.image,
      };
    });

    const taxes = [
      {
        name: "VAT",
        description:
          "Order amount has %" + TAB_ORDERS_TAX + " from total amount.",
        rate: {
          type: "F",
          value: vatAmount,
        },
      },
    ];
    taxes.push({
      name: "Shipping Fees",
      description: "shipping fees amount",
      rate: {
        type: "F",
        value: shippingFee,
      },
    });
    TPayment.CreateCharge({
      currency: "SAR",
      customer: {
        first_name: user.name,
        email: user.email,
      },
      order: {
        amount: orderTotalAmount,
        items,
        tax: taxes,
      },
      metadata:{
        orderId:id
      },
      post: location + route,
      redirect: location + route,
      ref_order: "ref-" + generateId,
      description: notes,
      source: undefined,
      amount: 0,
    })
      .then(({ data }) => {
        return res.json({ url: data.transaction.url });
      })
      .catch((err) => {
        console.log(err.response)
        const errors = err?.response?.data?.errors || [];
        const errorMessage = errors?.map((e) => e.description).join(" , ");
        return next(new ApiError("InternalServerError", errorMessage));
      });
  } catch (error) {
    next(error);
  }
}

export async function UpdateOrderStatus(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    // const { user_id } = pick(req.local, ['user_id']);
    const {
      merchant,
      status,
      orderId,
    }: // itemId,
    { merchant: string; status: StatusType; orderId: string; itemId: any } =
      pick(req.body, ["merchant", "status", "orderId", "itemId"]);

    const orderStatus: Record<StatusType, string> = {
      canceled: "canceled",
      completed: "completed",
      created: "under_review",
      in_review: "in_progress",
      in_transit: "in_progress",
      refunded: "restored",
    };

    const [order, user] = await Promise.all([
      Order.findOne({ _id: orderId, merchant }).exec(),
      User.findById(merchant).exec(),
    ]);

    const status_track = UpdateOrderTracking(status, order);

    order.status = status;
    // order.tracking_order_id ??= itemId;
    order.status_track = status_track;

    const access_token = CheckTokenExpire(user?.tokens);

    await Promise.all([
      await UpdateSallaStatus(
        orderStatus[status] as SallaOrderStatus,
        order.order_id,
        access_token
      ),
      order.save(),
    ]);

    res.json({
      message: "Order status updated successfully!!",
    });
  } catch (error) {
    next(error);
  }
}

export function UpdateOrderTracking(status: StatusType, order: OrderDocument) {
  let obj: StatusTrack;
  const orderJSON = order.toJSON();
  const tracking = orderJSON.status_track;

  obj = {
    createdAt: new Date(),
    status,
  };

  if (!tracking.length) {
    return [obj];
  }

  return [...tracking, obj];
}

export const UpdateCustomeDetails = async(req:Request,res:Response,next:NextFunction)=>{
  const {id,first_name,middle_name,last_name,mobile} = pick(req.body,['id','first_name','middle_name','last_name','mobile'])
  try {
    const order = await Order.findById(id)
    if(!order) return next(new ApiError("NotFound"))
    await Order.findByIdAndUpdate(id,{$set:{'customer.first_name':first_name,'customer.last_name':last_name,'customer.mobile':mobile,'customer.middle_name':middle_name}}).then(()=>  res.sendStatus(200))
  } catch (error) {
    next(error)
  }

}

export const UpdateCustomerAddress = async(req:Request,res:Response,next:NextFunction)=>{
  const {id,city,province,district,street,postal_code} = pick(req.body,['id','city','province','district','street','postal_code'])
  const order = await Order.findById(id)
  if(!order) return next(new ApiError("NotFound"))
  await Order.findByIdAndUpdate(id,
      {$set:
        {
        'shipping.address.country_code':'SA',
        'shipping.address.country':'SA',
        'shipping.address.city_en':city,
        'shipping.address.province_en':province,
        'shipping.address.district_en':district,
        'shipping.address.street_en':street,
        'shipping.address.postal_code':postal_code}}).then((response)=>    res.sendStatus(200))
}


export const updateShipping = async (req: Request, res: Response, next: NextFunction) => {
  const { id, shipping } = pick(req.body, ['id', 'shipping']);
  const order : any = await Order.findById(id);
  let totalShippingAmount = 0;

  if (!order) return next(new ApiError("NotFound"));

  const promises = shipping.map(async (productShip: any, i: number) => {
    return Product.findById(productShip.product_id).then((product) => {
      const filter = {
        _id: id,
        "items.product.sku": product.sku,
      };
      const update = {
        $set: {
          "items.$.product.shipping": {
            serviceName: productShip.service_name,
            amount: productShip.amount,
            tracking: productShip.tracking,
          },
        },
      };

      return Order.updateOne(filter, update).then(async () => {
        totalShippingAmount += parseFloat(productShip.amount);
      });
    });
  });

  // Wait for all update promises to complete before proceeding
  await Promise.all(promises);

  // Update the order's shippingFee with the totalShippingAmount
  order.shippingFee = totalShippingAmount;
  let orderShipVat = totalShippingAmount * (order.vat_value /100)
  order.amount_included_vat +=orderShipVat
  console.log(order.vat_value)
  console.log(orderShipVat)
  console.log(order.amount_included_vat)
  await order.save();


  res.sendStatus(200);
};

