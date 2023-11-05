import {
  Schema,
  model,
  Document,
  Types,
  SchemaDefinitionProperty,
  PaginateModel,
} from "mongoose";

interface SubscriptionSchema {
  orders_limit: number;
  products_limit: number;
  start_date: Date;
  expiry_date: Date;
  plan: SchemaDefinitionProperty<Types.ObjectId>;
  user: SchemaDefinitionProperty<Types.ObjectId>;
}

interface SubscriptionDocument extends Document, SubscriptionSchema {}

const options = {
  orders_limit: { type: Number || null, default: null, trim: true },
  products_limit: { type: Number || null, default: null, trim: true },

  start_date: {
    type: Date,
    default: null,
  },
  expiry_date: {
    type: Date,
    default: null,
  },
  plan: {
    type: Types.ObjectId,
    default: null,
    ref: "Plan",
  },
  user: {
    type: Types.ObjectId,
    default: null,
    ref: "User",
  },
};

const schema = new Schema<SubscriptionSchema>(options, { timestamps: true });
schema.index({ "$**": "text" });
schema.index({ "user.$**": "text" });
schema.index({ "plan.$**": "text" });

const Subscription = model<
  SubscriptionSchema,
  PaginateModel<SubscriptionDocument>
>("Subscription", schema, "Subscriptions");

export { SubscriptionSchema, SubscriptionDocument, Subscription };
