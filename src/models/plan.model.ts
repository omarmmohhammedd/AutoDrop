import {
  Schema,
  model,
  Document,
  Types,
  SchemaDefinitionProperty,
  PaginateModel,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

type DiscountTypes = "fixed" | "percentage";

interface PlanSchema {
  name: string;
  description: string;
  discount_price: number;
  discount_type: DiscountTypes;
  discount_value: number;
  orders_limit: number;
  products_limit: number;
  is_default: boolean;
  price: number;
  services: SchemaDefinitionProperty<any[]>;
  is_monthly: boolean;
}

interface PlanDocument extends Document, PlanSchema {}

const options = {
  name: { type: String, default: null, trim: true },
  description: { type: String, default: null, trim: true },
  discount_price: { type: Number, default: null, trim: true },
  discount_type: { type: String, default: null, trim: true },
  discount_value: { type: Number, default: null, trim: true },
  orders_limit: { type: Number || null, default: null, trim: true },
  products_limit: { type: Number || null, default: null, trim: true },
  is_default: { type: Boolean, default: false, trim: true },
  price: { type: Number, default: null, trim: true },
  services: { type: Array, default: null, trim: true },
  is_monthly: { type: Boolean, default: true },
};

const schema = new Schema<PlanSchema>(options, { timestamps: true });
schema.index({ "$**": "text" });
schema.plugin(mongoosePaginate);

const Plan = model<PlanSchema, PaginateModel<PlanDocument>>(
  "Plan",
  schema,
  "plans"
);

export { PlanSchema, PlanDocument, Plan };
