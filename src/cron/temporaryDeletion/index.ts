import { schedule } from "node-cron";
import { User } from "../../models/user.model";
import moment from "moment";
import { Subscription } from "../../models/subscription.model";
import { Order } from "../../models/order.model";
import { Product } from "../../models/product.model";
import { Transaction } from "../../models/transaction.model";

const time: string = "* */24 * * *";
// const time: string = "*/1 * * * *";

const deletionTask = schedule(time, async function () {
  try {
    console.log("cron job started to delete users, transactions and others");
    const users = await User.find({ deletedAt: { $ne: null } });

    for await (const user of users) {
      const remainingDays = moment().diff(
        new Date(user.deletedAt),
        "days",
        true
      );
      const roundDays = Math.round(remainingDays);

      // check if account should delete after 7days
      if (roundDays >= 7) {
        await Promise.all([
          Subscription.findOneAndDelete({
            user: user.id,
          }),
          Order.deleteMany({
            merchant: user.id,
          }),
          Product.deleteMany({
            merchant: user.id,
          }),
          Transaction.deleteMany({
            user: user.id,
          }),
        ]);

        console.log("account => ", user.id, " has been deleted successfully");
      }
    }

    //   await Promise.all([
    // 	User.
    //   ])
  } catch (error) {
    console.log("Error while deleting..");
    console.log(error);
  }
});

export default deletionTask;
