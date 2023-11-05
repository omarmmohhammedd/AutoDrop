import { schedule } from "node-cron";
import AEProduct from "../../../features/aliExpress/features/GetProductDetails";
import { Product } from "../../../models/product.model";

const time: string = "0 */12 * * *";
// const time: string = "* 1 * * *";
const { GetDetails } = new AEProduct();

const task = schedule(time, async function () {
  try {
    console.log(
      "cron job started to update products when original product price updated"
    );
    const products = await Product.find().exec();

    if (!products && !products.length) return;

    await Promise.all(
      products.map(async (product: any) => {
        const findProduct = await GetDetails({
          product_id: product.original_product_id as string,
        });

        if (!findProduct) return;

        if (product.main_price !== findProduct.main_price) {
          product.main_price = findProduct.main_price;
          product.price = findProduct.main_price + product.vendor_price;
          return product.save();
        }
      })
    );
  } catch (error) {
    console.log("Error while getting products details and update..");
    console.log(error);
  }
});

export default task;
