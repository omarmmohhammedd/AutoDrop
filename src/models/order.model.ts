import { PaginateModel } from "mongoose";
import {
  Schema,
  model,
  Document,
  Types,
  SchemaDefinitionProperty,
} from "mongoose";

interface ImageType {
  original: string;
  thumbnail: string;
  default: boolean;
  alt: string;
}

interface ValueType {
  name: string;
  price: number;
  quantity: number;
}

interface OptionType {
  name: string;
  display_type: string;
  values: ValueType[];
}

type StatusType =
  | "created"
  | "completed"
  | "in_review"
  | "canceled"
  | "refunded"
  | "in_transit";

interface StatusTrack {
  status: StatusType;
  createdAt: Date | string;
}
interface OrderSchema {
  order_id: string;
  reference_id: string;
  notes: string;
  date: any;
  payment_method: string;
  currency: string;
  amounts: any;
  meta: any;
  urls: any;
  shipping: any;
  customer: any;
  bank: any;
  items: SchemaDefinitionProperty<any[] | null>;
  status: StatusType;
  merchant: SchemaDefinitionProperty<Types.ObjectId>;
  tracking_order_id: SchemaDefinitionProperty<Schema.Types.Mixed>;
  status_track: SchemaDefinitionProperty<StatusTrack[]>;
  shippingFee:any;
  paid:any;
}

interface OrderDocument extends Document, OrderSchema {}

const options = {
  order_id: { type: String, default: null, trim: true },
  reference_id: { type: String, default: null, trim: true },
  date: { type: Map, default: null },
  payment_method: { type: String, default: null, trim: true },
  currency: { type: String, default: null, trim: true },
  amounts: { type: Map, default: null },
  urls: { type: Map, default: null },
  shipping: { type: Map, default: null },
  customer: { type: Map, default: null },
  bank: { type: Map, default: null },
  items: { type: Array, default: null },
  status: {
    type: String,
    default: null,
    trim: true,
    enums: [
      "created",
      "in_review",
      "in_transit",
      "in_progress",    
      "canceled",
      "completed",
    ],
  },
  meta: { type: Map, default: null },
  status_track: { type: Array },
  merchant: { type: String, default: null, trim: true },
  notes: { type: String, default: null, trim: true },
  tracking_order_id: { type: Schema.Types.Mixed, default: null },
  shippingFee:{type:Number,default:0},
  paid:{type:Boolean,default:false}
};

const schema = new Schema<OrderSchema>(options, { timestamps: true });

const Order = model<OrderSchema, PaginateModel<OrderDocument>>(
  "Order",
  schema,
  "orders"
);

export { Order, OrderSchema, OrderDocument, StatusType, StatusTrack };
