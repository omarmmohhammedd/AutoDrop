import { Request, Response, NextFunction } from "express";
import SallaEvents from "./events";

const events = new SallaEvents();

export default function AppWebHook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = req.body;
    const { event ,...other} = body;
    console.log("new event => ", event);

    switch (event) {
      case "app.store.authorize":
        return events.AuthorizeEvent(body, req, next);

      case "app.installed":
        return events.CreateNewApp(body, req, next);

      case "app.uninstalled":
        return events.RemoveApp(body, req, next);

      case "app.expired":

      case "app.updated":
      case "order.deleted":
        return events.DeleteSelectedOrder(body, req, next);

      case "order.created":
        return events.CreateNewOrder(body, res, next);

      case "order.status.updated":
        return events.UpdateOrderStatus(body, res, next);

      case "product.deleted":
        return events.DeleteSelectedProduct(body, req, next);

      case "order.deleted":
        return events.DeleteSelectedOrder(body, req, next);

      default:

        return true;
    }
  } catch (error: any) {
    console.log(error);
    next(error);
  }
}
