import { NextFunction, Request, Response } from "express";
import { pick } from "lodash";
import ApiError from "../../../errors/ApiError";
import { PlaceOrder } from "../../../features/aliExpress/features/PlaceOrder";
import BaseApi from "../../../features/baseApi";
import { Order } from "../../../models/order.model";


class AliExpressOrdersController extends BaseApi {
  async placeOrder(req: Request & any, res: Response, next: NextFunction) {
    try {
      const { id ,shipping} = pick(req.body, ["id","shipping"]);

      const order = await Order.findById(id);

      if (!order) throw new ApiError("NotFound", "Invalid order");

      const placeOrderResult: any = await PlaceOrder(order);
      order.status = "in_review";
      await order.save();

      super.send(res, placeOrderResult);
    } catch (error) {
      next(error);
    }
  }
}

export const { placeOrder } = new AliExpressOrdersController();
