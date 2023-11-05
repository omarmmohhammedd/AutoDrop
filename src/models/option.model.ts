import {
  Document,
  PaginateModel,
  Schema,
  SchemaDefinitionProperty,
  Types,
  model,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

interface ValueType {
  name: string;
  price: number;
  quantity: number;
  property_id: number;
  sku_id: number;
  sku: string;
}

interface OptionSchema {
  name: string;
  values: SchemaDefinitionProperty<ValueType[]>;
  productId: SchemaDefinitionProperty<Types.ObjectId>;
}

interface OptionDocument extends Document, OptionSchema {}

const options = {
  name: { type: String, default: null, trim: true },
  productId: { type: Types.ObjectId, ref: "Product", default: null },
  values: { type: Array, default: [] },
};

const schema = new Schema<OptionSchema>(options, { timestamps: true });
schema.index({ "$**": "text" });

schema.plugin(mongoosePaginate);

const Option = model<OptionSchema, PaginateModel<OptionDocument>>(
  "Option",
  schema,
  "options"
);

export { Option, OptionDocument, OptionSchema, ValueType };
