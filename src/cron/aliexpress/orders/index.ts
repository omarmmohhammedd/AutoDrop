import { schedule } from "node-cron";
import ModelFactor from "../../../features/ModelsFactor";
import MakeRequest from "../../../features/aliExpress/request";
import { Order, OrderDocument } from "../../../models/order.model";
import SallaRequest from "../../../features/salla/request";
import { UpdateOrderStatus } from "../../../controllers/orders";
import { User } from "../../../models/user.model";
import { UpdateSalaOrderStatus } from "../../../features/salla/orders";
import { CheckTokenExpire } from "../../../middlewares/authentication";
import ApiError from "../../../errors/ApiError";
// const time: string = "0 */12 * * *";
const time2: string = "*/1 * * * *";

let recall = false;
let page = 1;

const trackingOrdersTask = schedule(time2, async function () {
  await main();
});

async function main() {
  return new Promise(async (resolve) => {
    recall = await trackingOrders();

    if (!recall) return resolve(true);

    page += 1;

    await main();
    return resolve(true);
  });
}

async function trackingOrders(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    let hasMore = false;
    try {
      const orders = await ModelFactor(
        Order,
        { page },
        {
          tracking_order_id: {
            $ne: null,
          },
        }
      );

      const { data, pagination } = orders;

      await Promise.all(
        data?.map(async (order: OrderDocument) => {
          const orderData = order.toJSON()
          const order_id = orderData.tracking_order_id
          const body = {
            method: "aliexpress.trade.ds.order.get",
            single_order_query: JSON.stringify({ order_id }),
          };

          const { data: trackingResponse } = await MakeRequest(body);
          const response =
            trackingResponse?.aliexpress_trade_ds_order_get_response;
          const list =
            response?.result?.child_order_list?.aeop_child_order_info;
        })
      );

      hasMore = pagination.hasNextPage || false;

      resolve(hasMore);
    } catch (error) {
      console.log("error while tracking order details => ", error);
    }
  });
}

export default trackingOrdersTask;


const time: string = "0 0 */3 * *";
// const time: string = "*/5 * * * * *";
export const updateOrderStatus =schedule(time,async()=>{
  console.log('Cron Start To Tracking And Update Order Status ')
  try {
  const orders = await Order.find({})
  if(orders.length){
    orders.forEach(async(order)=>{
      const orderData = order.toJSON()
      if(orderData.tracking_order_id){
          const body = {
              method: "aliexpress.trade.ds.order.get",
              single_order_query: JSON.stringify({ order_id:orderData.tracking_order_id }),
              sign_method: "sha256",          };
              const { data: trackingResponse } = await MakeRequest(body);
              const orderStatus = trackingResponse?.aliexpress_trade_ds_order_get_response?.result?.order_status
              const user = await User.findById(order.merchant)
              const tokens = user?.tokens;
              const access_token = CheckTokenExpire(tokens);
              if (orderStatus === 'PLACE_ORDER_SUCCESS'){
                await Order.findByIdAndUpdate(orderData.id,{status:'in_review'})
              }else if (orderStatus === 'IN_CANCEL'){
                await UpdateSalaOrderStatus('canceled',order.order_id,access_token)
                .then(async()=> await Order.findByIdAndUpdate(orderData.id,{status:'canceled'}))
              }else if (orderStatus === 'WAIT_SELLER_SEND_GOODS'){
                await UpdateSalaOrderStatus('in_progress',order.order_id,access_token).then(async()=> await Order.findByIdAndUpdate(orderData.id,{status:'in_progress'}))
              }else if(orderStatus === 'WAIT_BUYER_ACCEPT_GOODS'){
                await UpdateSalaOrderStatus('delivering',order.order_id,access_token).then(async()=> await Order.findByIdAndUpdate(orderData.id,{status:'delivering'}))
              }else if (orderStatus === 'FINISH'){
                await UpdateSalaOrderStatus('delivered',order.order_id,access_token).then(async()=> await Order.findByIdAndUpdate(orderData.id,{status:'completed'}))
              }
              else return;
      }
    })
  }
  } catch (error) {
    console.log(error.response)
    // throw new ApiError('500',error)
  }
  
}) 
