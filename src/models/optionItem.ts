import {
  Document,
  PaginateModel,
  Schema,
  SchemaDefinitionProperty,
  Types,
  model,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

interface ValueItemType {
  store_value_id?: string;
  store_variant_id?: string;
  mpn?: string | number;
  gtin?: string | number;
}

interface OptionItemSchema {
  values: SchemaDefinitionProperty<ValueItemType[]>;
  optionId: SchemaDefinitionProperty<Types.ObjectId>;
  productId: SchemaDefinitionProperty<Types.ObjectId>;
  userId: SchemaDefinitionProperty<Types.ObjectId>;
  display_type: string;
  store_option_id: string;
}

interface OptionItemDocument extends Document, OptionItemSchema {}

const options = {
  productId: { type: Types.ObjectId, ref: "ProductItem", default: null },
  optionId: { type: Types.ObjectId, ref: "Option", default: null },
  userId: { type: Types.ObjectId, ref: "User", default: null },
  display_type: { type: String, default: "text", trim: true },
  store_option_id: { type: String, default: null, trim: true },
  values: { type: Array, default: [] },
};

const schema = new Schema<OptionItemSchema>(options, { timestamps: true });
schema.index({ "$**": "text" });

schema.plugin(mongoosePaginate);

const OptionItem = model<OptionItemSchema, PaginateModel<OptionItemDocument>>(
  "OptionItem",
  schema,
  "optionsItem"
);

export { OptionItem, OptionItemDocument, OptionItemSchema, ValueItemType };
